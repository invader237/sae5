# app/model/domain/service/activations.py
from __future__ import annotations

import math
import os
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import torch
from PIL import Image
from torch import nn
import torchvision.utils as vutils

from app.model.domain.service.transforms import (
    open_image_from_bytes,
    default_preprocess,
)


def _default_layers_for_model(model: nn.Module) -> List[str]:
    """
    Preset raisonnable et léger (ResNet50):
      - conv1
      - layer2.0.conv1
      - layer3.0.conv1
      - layer4.2.conv3
    """
    mods = dict(model.named_modules())
    candidates = ["conv1", "layer2.0.conv1", "layer3.0.conv1", "layer4.2.conv3"]
    return [c for c in candidates if c in mods]


def _normalize_01(t: torch.Tensor) -> torch.Tensor:
    t_min = float(t.min())
    t_max = float(t.max())
    return (t - t_min) / (t_max - t_min + 1e-6)


def _feature_to_heatmap(feature: torch.Tensor) -> Image.Image:
    """
    feature: [1,C,H,W] or [C,H,W]
    -> heatmap grayscale (0..255) based on mean(C)
    """
    if feature.ndim == 4:
        feature = feature[0]
    if feature.ndim != 3:

        arr = feature.detach().cpu().float().reshape(-1).numpy()
        arr = (arr - arr.min()) / (arr.max() - arr.min() + 1e-6)
        img = (arr * 255).astype("uint8")[None, :]
        return Image.fromarray(img)


    fmap = feature.float().mean(dim=0)
    fmap = _normalize_01(fmap)
    arr = (fmap * 255).clamp(0, 255).byte().cpu().numpy()
    return Image.fromarray(arr, mode="L")


def _resize_to(img: Image.Image, size: Tuple[int, int]) -> Image.Image:
    return img.resize(size, Image.Resampling.BILINEAR)


def _heatmap_to_overlay(original_rgb: Image.Image, heatmap_l: Image.Image, alpha: float = 0.45) -> Image.Image:
    """
    overlay = original * (1-alpha) + heatmap(gray->rgb) * alpha
    """
    hm_rgb = heatmap_l.convert("RGB")
    return Image.blend(original_rgb, hm_rgb, alpha=alpha)


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
    """
    Génère des heatmaps + overlays pour une image déjà existante.
    Retourne un payload avec token + items (url + layer + type + shape).
    Sauvegarde les PNG dans: <uploads_dir>/activations/<token>/
    """
    if device is None:
        device = torch.device("cpu")

    model.eval()
    model.to(device)

    layers_to_hook = layers[:] if layers else _default_layers_for_model(model)
    name_to_module = dict(model.named_modules())

    activations: Dict[str, torch.Tensor] = {}
    hooks: List[torch.utils.hooks.RemovableHandle] = []

    def _make_hook(name: str):
        def hook(_m, _inp, out):
            try:
                if isinstance(out, (tuple, list)):
                    out = out[0]
                if torch.is_tensor(out):
                    activations[name] = out.detach().cpu()
            except Exception:
                pass
        return hook

    for lname in layers_to_hook:
        mod = name_to_module.get(lname)
        if mod is not None:
            hooks.append(mod.register_forward_hook(_make_hook(lname)))


    original = open_image_from_bytes(image_bytes).convert("RGB")
    tensor = default_preprocess(original, size=input_size, mean=mean, std=std).to(device)


    with torch.no_grad():
        _ = model(tensor)

    for h in hooks:
        try:
            h.remove()
        except Exception:
            pass


    uploads_dir = uploads_dir or os.environ.get("UPLOAD_DIR") or "/app/uploads"
    token = str(uuid.uuid4())
    base = Path(uploads_dir) / "activations" / token
    base.mkdir(parents=True, exist_ok=True)

    items: List[Dict[str, Any]] = []


    original_path = base / "original.png"
    try:
        original.save(original_path)
        items.append({
            "layer": "original",
            "type": "original",
            "shape": [1, 3, input_size, input_size],
            "file": str(original_path),
            "url": f"/pictures/activations/{token}/image/original.png",
        })
    except Exception:
        pass


    target_size = (input_size, input_size)
    original_resized = _resize_to(original, target_size)

    for layer_name, feat in activations.items():
        shape = list(feat.shape) if torch.is_tensor(feat) else None


        heatmap_img = None
        if include_heatmaps:
            try:
                hm = _feature_to_heatmap(feat)
                hm = _resize_to(hm, target_size)
                fname = f"{layer_name.replace('.', '_')}_heatmap.png"
                path = base / fname
                hm.save(path)
                items.append({
                    "layer": layer_name,
                    "type": "heatmap",
                    "shape": shape,
                    "file": str(path),
                    "url": f"/pictures/activations/{token}/image/{fname}",
                })
                heatmap_img = hm
            except Exception as e:
                items.append({"layer": layer_name, "type": "heatmap", "shape": shape, "error": str(e)})


        if include_overlays:
            try:
                if heatmap_img is None:
                    hm = _feature_to_heatmap(feat)
                    heatmap_img = _resize_to(hm, target_size)
                ov = _heatmap_to_overlay(original_resized, heatmap_img, alpha=0.45)
                fname = f"{layer_name.replace('.', '_')}_overlay.png"
                path = base / fname
                ov.save(path)
                items.append({
                    "layer": layer_name,
                    "type": "overlay",
                    "shape": shape,
                    "file": str(path),
                    "url": f"/pictures/activations/{token}/image/{fname}",
                })
            except Exception as e:
                items.append({"layer": layer_name, "type": "overlay", "shape": shape, "error": str(e)})

    return {
        "token": token,
        "layers_requested": layers_to_hook,
        "items": items,
    }
