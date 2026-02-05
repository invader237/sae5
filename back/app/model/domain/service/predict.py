"""Inference utilities for image classification using PyTorch.
                if (
                    isinstance(data, dict)
                    and "classes" in data
                    and isinstance(data["classes"], list)
                ):
                    LABELS_CACHE[model_version] = [
                        str(x)
                        for x in data["classes"]
                    ]
                else:
                    raise ValueError("label sidecar malformed")
        except Exception as e:
            raise FileNotFoundError(
                "Failed to load label sidecar %s: %s" % (preferred_label, e)
            )

If `model_loader` is omitted, the code will look for a `.pth`/`.pt` under
the mounted models folder (`/app/models`). The code will then attempt to
load the model file.
"""


from __future__ import annotations

import time
import uuid
from typing import Any, Callable, Dict, Iterable, List, Optional, Tuple

import torch
import os
import json
from pathlib import Path
from torch import nn
from PIL import Image

import app.model.domain.catalog.model_catalog as model_catalog
from app.model.domain.service.transforms import (
    open_image_from_bytes,
    default_preprocess,
)

MODEL_CACHE: Dict[str, torch.nn.Module] = {}
LABELS_CACHE: Dict[str, List[str]] = {}
PREPROCESS_CACHE: Dict[str, Dict[str, Any]] = {}


def load_model(
    model_version: str,
    model_loader: Optional[Callable[[str], Any]] = None,
    device: Optional[torch.device] = None,
) -> torch.nn.Module:
    if device is None:
        device = torch.device("cpu")

    if model_version in MODEL_CACHE:
        return MODEL_CACHE[model_version]

    resolved_path: Optional[str] = None

    if model_loader is None:
        models_dir = os.environ.get("MODEL_DIR", "/app/models")
        base = Path(models_dir)

        candidate: Optional[Path] = None
        if model_version:
            mv = base / model_version
            if mv.is_file() and mv.suffix.lower() in (".pth", ".pt"):
                candidate = mv
            elif mv.is_dir():
                pths = sorted(mv.glob("*.pth")) + sorted(mv.glob("*.pt"))
                candidate = pths[-1] if pths else None
            else:
                p = base / (model_version + ".pth")
                if p.is_file():
                    candidate = p

        if candidate is None:
            pths = sorted(base.glob("*.pth")) + sorted(base.glob("*.pt"))
            candidate = pths[-1] if pths else None

        if candidate is None:
            raise ValueError(
                "No .pth/.pt found in MODEL_DIR and no model_loader provided")

        resolved_path = str(candidate)
    else:
        loaded = model_loader(model_version)
        if isinstance(loaded, torch.nn.Module):
            module = loaded
            module.to(device)
            module.eval()
            MODEL_CACHE[model_version] = module
            return module

        if isinstance(loaded, (tuple, list)) and len(loaded) > 0:
            first = loaded[0]
            if isinstance(first, torch.nn.Module):
                module = first
                module.to(device)
                module.eval()
                MODEL_CACHE[model_version] = module
                return module
            if isinstance(first, str):
                resolved_path = first

            if len(loaded) > 1 and loaded[1] is not None:
                try:
                    LABELS_CACHE[model_version] = list(loaded[1])
                except Exception:
                    pass
            if len(loaded) > 2 and loaded[2] is not None:
                try:
                    PREPROCESS_CACHE[model_version] = dict(loaded[2])
                except Exception:
                    pass
        elif isinstance(loaded, str):
            resolved_path = loaded
        else:
            raise ValueError("model_loader returned unsupported type")

    module = None
    if resolved_path is not None:
        rp = Path(resolved_path)
        if not rp.is_absolute():
            resolved_path = str(Path("/app/models") / resolved_path)

        # Try TorchScript first
        try:
            try:
                module = torch.jit.load(resolved_path, map_location=device)
                try:
                    _try_load_sidecar(resolved_path, model_version)
                except FileNotFoundError as e:
                    print(
                        f"[WARN] sidecar not loaded for {resolved_path}: {e}")
            except RuntimeError as e:
                msg = str(e)
                if any(x in msg for x in
                       ("PytorchStreamReader", "constants.pkl", "unsupported")
                       ):
                    module = None
                else:
                    raise
        except Exception:
            module = None

        if module is None:
            module = _build_module_from_state(resolved_path, device=device)
            try:
                _try_load_sidecar(resolved_path, model_version)
            except FileNotFoundError as e:
                print(f"[WARN] sidecar not loaded for {resolved_path}: {e}")

    if module is None:
        raise ValueError(f"Unable to load model for version {model_version}")

    module.to(device)
    module.eval()
    MODEL_CACHE[model_version] = module
    return module


def _postprocess_logits(
    logits: torch.Tensor,
    top_k: int = 3,
) -> Tuple[List[int], List[float]]:
    probs = torch.softmax(logits, dim=1)
    topk = torch.topk(probs, k=min(top_k, probs.shape[1]), dim=1)
    indices = topk.indices[0].tolist()
    scores = topk.values[0].tolist()
    return indices, scores


def _default_activation_layers(m: nn.Module) -> List[str]:
    """
    Default layers intended for human-readable viz.
    For ResNet50: spatial conv layers across depth.
    For scratch models: first conv layers.
    """
    mods = dict(m.named_modules())

    # ResNet-ish
    preferred = [
        "conv1",
        "layer1.0.conv1",
        "layer2.0.conv1",
        "layer3.0.conv1",
        "layer4.2.conv3",
    ]
    layers = [n for n in preferred if n in mods]
    if layers:
        return layers

    # Scratch fallback: first 3 Conv2d
    convs = [n for n, mod in m.named_modules() if isinstance(mod, nn.Conv2d)]
    return convs[:3]


def _to_grayscale_heatmap_01(feat_chw: torch.Tensor) -> torch.Tensor:
    """
    feat_chw: [C,H,W] -> heatmap [H,W] normalized to [0,1]
    """
    heat = feat_chw.mean(dim=0)  # [H,W]
    heat = heat - heat.min()
    heat = heat / (heat.max() + 1e-6)
    return heat.clamp(0, 1)


def _heatmap_to_pil(heat_hw_01: torch.Tensor,
                    out_size: Tuple[int, int]) -> Image.Image:
    """
    heatmap [H,W] in [0,1] -> PIL grayscale resized to out_size.
    """
    arr = (heat_hw_01 * 255).byte().cpu().numpy()
    img = Image.fromarray(arr, mode="L")
    if img.size != out_size:
        img = img.resize(out_size, Image.Resampling.BILINEAR)
    return img


def _overlay_on_image(original_rgb: Image.Image, heat_gray: Image.Image,
                      alpha: float = 0.45) -> Image.Image:
    """
    Overlay grayscale heatmap onto the original image using a simple blend.
    (No colormap dependency; keeps it lightweight.)
    """
    base = original_rgb.convert("RGB")
    heat_rgb = Image.merge("RGB", (heat_gray, heat_gray, heat_gray))
    return Image.blend(base, heat_rgb, alpha=alpha)


def predict_image(
    image_bytes: bytes,
    catalog: model_catalog.ModelCatalog,
    top_k: int = 3,
    confidence_threshold: float = 0.8,
    labels: Optional[Iterable[str]] = None,
    preprocess_config: Optional[Dict[str, Any]] = None,
    save_callback: Optional[Callable[[bytes, Dict[str, Any]], None]] = None,
    device: Optional[torch.device] = None,
    activation_layers: Optional[List[str]] = None,
    save_activations_to: Optional[str] = None,
    max_activation_channels: int = 64,
) -> Dict[str, Any]:
    if device is None:
        device = torch.device("cpu")

    start_time = time.time()

    active_model = catalog.find_active_model()
    if active_model is None:
        raise RuntimeError("No active model configured in database")

    model_version = active_model.path
    model = load_model(model_version, device=device)

    # labels
    labels_list: Optional[List[str]] = LABELS_CACHE.get(model_version)
    if labels is not None:
        labels_list = list(labels)

    # preprocess config
    pc = PREPROCESS_CACHE.get(model_version, {}).copy()
    if preprocess_config:
        pc.update(preprocess_config)

    size = pc.get("size", active_model.input_size)  # usually 384 in your app
    mean = pc.get("mean")
    std = pc.get("std")

    # original image (for overlay)
    original = open_image_from_bytes(image_bytes).convert("RGB")
    original_resized = original.resize((size, size), Image.Resampling.BILINEAR)

    # model tensor
    tensor = default_preprocess(original, size=size,
                                mean=mean, std=std).to(device)

    # hooks
    hooks: List[torch.utils.hooks.RemovableHandle] = []
    activations: Dict[str, torch.Tensor] = {}

    def _make_hook(name: str):
        def hook(module, inp, out):
            try:
                if isinstance(out, (tuple, list)):
                    out = out[0]
                if torch.is_tensor(out):
                    # store on CPU
                    activations[name] = out.detach().cpu()
            except Exception:
                pass
        return hook

    layers_to_hook = activation_layers or _default_activation_layers(model)

    if layers_to_hook:
        try:
            name_to_module = dict(model.named_modules())
            for n in layers_to_hook:
                if n in name_to_module:
                    hooks.append(name_to_module[n].register_forward_hook(
                        _make_hook(n)))
                else:
                    print(f"[ACTIVATIONS][WARN] layer '{n}' not found")
        except Exception as e:
            print(f"[ACTIVATIONS][WARN] cannot register hooks: {e}")
            hooks = []

    # inference
    with torch.no_grad():
        logits = model(tensor)
        if logits.ndim == 1:
            logits = logits.unsqueeze(0)
        indices, scores = _postprocess_logits(logits, top_k=top_k)

    # cleanup hooks
    for h in hooks:
        try:
            h.remove()
        except Exception:
            pass

    # activations -> images
    activations_payload: Optional[Dict[str, Any]] = None
    if activations:
        uploads_dir = save_activations_to or os.environ.get(
            "UPLOAD_DIR") or "uploads"
        token = str(uuid.uuid4())
        base = Path(uploads_dir) / "activations" / token
        base.mkdir(parents=True, exist_ok=True)

        items: List[Dict[str, Any]] = []
        out_size = (size, size)

        for name, at in activations.items():
            try:
                # Expect conv-like tensors: [N,C,H,W]
                if at.ndim == 4:
                    feat = at[0]  # [C,H,W]
                elif at.ndim == 3:
                    feat = at
                else:
                    # Non-spatial (vector) -> skip (or you could render bars)
                    items.append({
                        "layer": name,
                        "shape": list(at.shape),
                        "skipped": True,
                        "reason": "non_spatial_tensor",
                    })
                    continue

                # Safety: cap channels if insane
                if feat.shape[0] > max_activation_channels:
                    feat = feat[:max_activation_channels]

                heat01 = _to_grayscale_heatmap_01(feat)
                heat_img = _heatmap_to_pil(
                    heat01, out_size=out_size)
                overlay = _overlay_on_image(
                    original_resized, heat_img, alpha=0.45)

                # Save both heatmap and overlay for "pro" UX
                safe = name.replace(".", "_")

                heat_fname = f"{safe}__heat.png"
                heat_path = base / heat_fname
                heat_img.save(heat_path)

                ov_fname = f"{safe}__overlay.png"
                ov_path = base / ov_fname
                overlay.save(ov_path)

                items.append({
                    "layer": name,
                    "shape": list(at.shape),
                    "type": "heatmap",
                    "file": str(heat_path),
                    "url": f"/pictures/activations/{token}/image/{heat_fname}",
                })
                items.append({
                    "layer": name,
                    "shape": list(at.shape),
                    "type": "overlay",
                    "file": str(ov_path),
                    "url": f"/pictures/activations/{token}/image/{ov_fname}",
                })

            except Exception as e:
                items.append({
                    "layer": name,
                    "shape": list(at.shape) if torch.is_tensor(at) else None,
                    "error": str(e),
                })

        activations_payload = {
            "token": token,
            "layers_requested": layers_to_hook,
            "items": items,
        }

    # mapping indices → labels
    preds: List[Dict[str, Any]] = []
    for idx, score in zip(indices, scores):
        label = str(idx)
        if labels_list is not None and idx < len(labels_list):
            label = labels_list[idx]
        preds.append({"label": label, "score": float(score)})

    top_score = preds[0]["score"] if preds else 0.0
    accepted = top_score >= confidence_threshold
    elapsed_ms = (time.time() - start_time) * 1000.0

    result: Dict[str, Any] = {
        "predictions": preds,
        "model_version": model_version,
        "accepted": bool(accepted),
        "time_ms": float(elapsed_ms),
        "activations": activations_payload,
    }

    # callback save
    if accepted and save_callback is not None:
        metadata: Dict[str, Any] = {
            "model_version": model_version,
            "predicted_label": preds[0]["label"] if preds else None,
            "predicted_score": preds[0]["score"] if preds else None,
            "timestamp": int(time.time()),
            "id": str(uuid.uuid4()),
        }
        try:
            save_callback(image_bytes, metadata)
            result["save_callback_ok"] = True
        except Exception as e:
            result["save_callback_ok"] = False
            result["save_callback_error"] = str(e)

    top_prediction = preds[0] if preds else None
    result["top_prediction"] = top_prediction
    result["top_score"] = float(top_score) if top_prediction else 0.0
    result["top_label"] = top_prediction["label"] if top_prediction else None

    return result


def _try_load_sidecar(path: str, model_version: str) -> None:
    p = Path(path)
    preferred_label = p.parent / (p.stem + "-label.json")
    if preferred_label.is_file():
        with open(preferred_label, "r") as fh:
            data = json.load(fh)
            if isinstance(data, dict) and "classes" in data and isinstance(
                    data["classes"], list):
                LABELS_CACHE[model_version] = [str(x) for x in data["classes"]]
            else:
                raise ValueError("label sidecar malformed")

    preferred_preprocess = p.parent / (p.stem + "-preprocess.json")
    if preferred_preprocess.is_file():
        try:
            with open(preferred_preprocess, "r") as fh:
                PREPROCESS_CACHE[model_version] = json.load(fh)
        except Exception:
            pass

    if model_version not in LABELS_CACHE:
        raise FileNotFoundError(
            "Label sidecar not found for model at %s; expected %s"
            % (p, preferred_label)
        )


def _build_module_from_state(
    path: str,
    num_classes: Optional[int] = None,
    device: Optional[torch.device] = None,
    arch: str = "resnet50",
) -> nn.Module:
    if device is None:
        device = torch.device("cpu")

    state = torch.load(path, map_location="cpu")
    if isinstance(state, dict):
        if "state_dict" in state:
            state_dict = state["state_dict"]
        elif "model_state" in state:
            state_dict = state["model_state"]
        else:
            state_dict = state
    else:
        raise ValueError("State loaded is not a dict/state_dict")

    new_state = {
        k[len("module."):] if k.startswith("module.") else k: v
        for k, v in state_dict.items()
    }

    if num_classes is None:
        for k, v in new_state.items():
            if k.endswith("fc.weight") or "fc.weight" in k:
                try:
                    num_classes = int(v.shape[0])
                    break
                except Exception:
                    continue

    from torchvision import models

    if arch == "resnet50":
        try:
            model = models.resnet50(weights=None)
        except Exception:
            model = models.resnet50(pretrained=False)
    else:
        raise ValueError(f"Architecture {arch} not supported")

    if num_classes is not None and hasattr(
            model, "fc") and isinstance(model.fc, nn.Linear):
        in_feat = model.fc.in_features
        model.fc = nn.Linear(in_feat, num_classes)

    model.load_state_dict(new_state, strict=False)
    model.to(device)
    model.eval()
    return model
