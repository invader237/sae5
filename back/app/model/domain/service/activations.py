# app/model/domain/service/activations.py
from __future__ import annotations

import math
import os
import uuid
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple

import torch
from PIL import Image
from torch import nn
import torchvision.utils as vutils

from app.model.domain.service.transforms import (
    open_image_from_bytes,
    default_preprocess,
)


class ActivationGenerator:
    """Generates step-by-step activation visualisations for any model.

    By default every first-level child module is hooked so the user sees the
    output after *each layer* in execution order.  The ``display_name`` of
    each item is the PyTorch class name (``Conv2d``, ``ReLU``, …).
    """

    def __init__(
        self,
        device: Optional[torch.device] = None,
        uploads_dir: Optional[str] = None,
    ) -> None:
        self.device = device or torch.device("cpu")
        self.uploads_dir = (
            uploads_dir or os.environ.get("UPLOAD_DIR") or "/app/uploads"
        )

    # ------------------------------------------------------------------
    # Helpers – layer introspection
    # ------------------------------------------------------------------

    @staticmethod
    def _get_display_name(module: nn.Module) -> str:
        """Return the human-readable type: 'Conv2d', 'ReLU', …"""
        return type(module).__name__

    @staticmethod
    def _get_all_children(model: nn.Module) -> List[Tuple[str, nn.Module]]:
        """First-level children – gives one step per layer for Sequential
        models and one step per major block for ResNet-like architectures."""
        children = list(model.named_children())
        if children:
            return children
        # Model has no children (single layer) → return itself
        return [("model", model)]

    # ------------------------------------------------------------------
    # Helpers – image processing
    # ------------------------------------------------------------------

    def _normalize_01(self, t: torch.Tensor) -> torch.Tensor:
        t_min = float(t.min())
        t_max = float(t.max())
        return (t - t_min) / (t_max - t_min + 1e-6)

    def _feature_to_heatmap(self, feature: torch.Tensor) -> Image.Image:
        """Convert any activation tensor to a grayscale heatmap image.

        Handles:
        - [1, C, H, W] or [C, H, W]  → mean over C → 2-D map
        - [H, W]                      → direct 2-D map
        - [1, N] or [N]               → reshape to closest square
        """
        if feature.ndim == 4:
            feature = feature[0]

        if feature.ndim == 3:
            # Spatial feature map – mean over channels
            fmap = feature.float().mean(dim=0)
        elif feature.ndim == 2 and feature.shape[0] == 1:
            # [1, N] after Linear – reshape to square
            fmap = feature[0].float()
            n = fmap.numel()
            side = int(math.ceil(math.sqrt(n)))
            padded = torch.zeros(side * side)
            padded[:n] = fmap
            fmap = padded.reshape(side, side)
        elif feature.ndim == 2:
            # [H, W] – already spatial
            fmap = feature.float()
        elif feature.ndim == 1:
            # [N] – reshape to square
            fmap = feature.float()
            n = fmap.numel()
            side = int(math.ceil(math.sqrt(n)))
            padded = torch.zeros(side * side)
            padded[:n] = fmap
            fmap = padded.reshape(side, side)
        else:
            fmap = feature.detach().cpu().float().reshape(-1)
            n = fmap.numel()
            side = int(math.ceil(math.sqrt(max(n, 1))))
            padded = torch.zeros(side * side)
            padded[:n] = fmap
            fmap = padded.reshape(side, side)

        fmap = self._normalize_01(fmap)
        arr = (fmap * 255).clamp(0, 255).byte().cpu().numpy()
        return Image.fromarray(arr, mode="L")

    @staticmethod
    def _resize_to(img: Image.Image, size: Tuple[int, int]) -> Image.Image:
        return img.resize(size, Image.Resampling.BILINEAR)

    @staticmethod
    def _heatmap_to_overlay(
        original_rgb: Image.Image,
        heatmap_l: Image.Image,
        alpha: float = 0.45,
    ) -> Image.Image:
        hm_rgb = heatmap_l.convert("RGB")
        return Image.blend(original_rgb, hm_rgb, alpha=alpha)

    # ------------------------------------------------------------------
    # Core generation
    # ------------------------------------------------------------------

    def generate_activations(
        self,
        *,
        model: nn.Module,
        image_bytes: bytes,
        input_size: int,
        mean: Optional[List[float]] = None,
        std: Optional[List[float]] = None,
        layers: Optional[List[str]] = None,
        include_heatmaps: bool = True,
        include_overlays: bool = True,
        device: Optional[torch.device] = None,
    ) -> Dict[str, Any]:
        device = device or self.device

        model.eval()
        model.to(device)

        name_to_module = dict(model.named_modules())

        # ----- Determine which modules to hook -----
        if layers:
            # Explicit layer names requested (backward compat)
            children_info = [
                (n, name_to_module[n]) for n in layers if n in name_to_module
            ]
        else:
            # Step-by-step: hook every first-level child
            children_info = self._get_all_children(model)

        display_names: Dict[str, str] = {
            name: self._get_display_name(mod) for name, mod in children_info
        }
        layers_to_hook = [name for name, _ in children_info]

        # ----- Register hooks (ordered list preserves execution order) -----
        ordered_activations: List[Tuple[str, str, torch.Tensor]] = []
        hooks: List[torch.utils.hooks.RemovableHandle] = []

        def _make_hook(lname: str, disp: str):
            def hook(_m, _inp, out):
                try:
                    if isinstance(out, (tuple, list)):
                        out = out[0]
                    if torch.is_tensor(out):
                        ordered_activations.append(
                            (lname, disp, out.detach().cpu())
                        )
                except Exception:
                    pass
            return hook

        for lname in layers_to_hook:
            mod = name_to_module.get(lname)
            if mod is not None:
                disp = display_names.get(lname, self._get_display_name(mod))
                try:
                    hooks.append(
                        mod.register_forward_hook(_make_hook(lname, disp))
                    )
                except Exception as exc:
                    print(
                        f"[ACTIVATIONS][WARN] hook failed for {lname}: {exc}"
                    )

        # ----- Forward pass -----
        original = open_image_from_bytes(image_bytes).convert("RGB")
        tensor = default_preprocess(
            original, size=input_size, mean=mean, std=std,
        ).to(device)

        with torch.no_grad():
            _ = model(tensor)

        for h in hooks:
            try:
                h.remove()
            except Exception:
                pass

        # ----- Save images -----
        token = str(uuid.uuid4())
        base = Path(self.uploads_dir) / "activations" / token
        base.mkdir(parents=True, exist_ok=True)

        items: List[Dict[str, Any]] = []
        target_size = (input_size, input_size)

        # Original
        original_path = base / "original.png"
        try:
            original.save(original_path)
            items.append({
                "step": -1,
                "layer": "original",
                "display_name": "Original",
                "type": "original",
                "shape": [1, 3, input_size, input_size],
                "file": str(original_path),
                "url": f"/pictures/activations/{token}/image/original.png",
            })
        except Exception:
            pass

        original_resized = self._resize_to(original, target_size)

        for step_idx, (layer_name, disp_name, feat) in enumerate(
            ordered_activations
        ):
            shape = list(feat.shape) if torch.is_tensor(feat) else None
            safe_name = layer_name.replace(".", "_")

            heatmap_img = None
            if include_heatmaps:
                try:
                    hm = self._feature_to_heatmap(feat)
                    hm = self._resize_to(hm, target_size)
                    fname = f"step_{step_idx:02d}_{safe_name}_heatmap.png"
                    path = base / fname
                    hm.save(path)
                    items.append({
                        "step": step_idx,
                        "layer": layer_name,
                        "display_name": disp_name,
                        "type": "heatmap",
                        "shape": shape,
                        "file": str(path),
                        "url": (
                            f"/pictures/activations/{token}/image/{fname}"
                        ),
                    })
                    heatmap_img = hm
                except Exception as e:
                    items.append({
                        "step": step_idx,
                        "layer": layer_name,
                        "display_name": disp_name,
                        "type": "heatmap",
                        "shape": shape,
                        "error": str(e),
                    })

            if include_overlays:
                try:
                    if heatmap_img is None:
                        hm = self._feature_to_heatmap(feat)
                        heatmap_img = self._resize_to(hm, target_size)
                    ov = self._heatmap_to_overlay(
                        original_resized, heatmap_img, alpha=0.45,
                    )
                    fname = f"step_{step_idx:02d}_{safe_name}_overlay.png"
                    path = base / fname
                    ov.save(path)
                    items.append({
                        "step": step_idx,
                        "layer": layer_name,
                        "display_name": disp_name,
                        "type": "overlay",
                        "shape": shape,
                        "file": str(path),
                        "url": (
                            f"/pictures/activations/{token}/image/{fname}"
                        ),
                    })
                except Exception as e:
                    items.append({
                        "step": step_idx,
                        "layer": layer_name,
                        "display_name": disp_name,
                        "type": "overlay",
                        "shape": shape,
                        "error": str(e),
                    })

        return {
            "token": token,
            "layers_requested": layers_to_hook,
            "items": items,
        }


# ------------------------------------------------------------------
# Module-level singleton + backward-compatible free function
# ------------------------------------------------------------------

_DEFAULT_ACTIVATION_GENERATOR = ActivationGenerator()


def generate_activations(
    *,
    model: nn.Module,
    image_bytes: bytes,
    input_size: int,
    mean: Optional[List[float]] = None,
    std: Optional[List[float]] = None,
    layers: Optional[List[str]] = None,
    include_heatmaps: bool = True,
    include_overlays: bool = True,
    uploads_dir: Optional[str] = None,
    device: Optional[torch.device] = None,
) -> Dict[str, Any]:
    """Backward-compatible wrapper around ``ActivationGenerator``."""
    gen = _DEFAULT_ACTIVATION_GENERATOR
    if uploads_dir or device is not None:
        gen = ActivationGenerator(
            device=device or gen.device,
            uploads_dir=uploads_dir or gen.uploads_dir,
        )

    return gen.generate_activations(
        model=model,
        image_bytes=image_bytes,
        input_size=input_size,
        mean=mean,
        std=std,
        layers=layers,
        include_heatmaps=include_heatmaps,
        include_overlays=include_overlays,
        device=device,
    )
