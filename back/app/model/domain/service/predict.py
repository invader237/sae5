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
    # If no loader provided, try to resolve a .pth/.pt from MODEL_DIR
    resolved_path: Optional[str] = None

    if model_loader is None:
        models_dir = os.environ.get("MODEL_DIR", "/app/models")
        base = Path(models_dir)

        # prefer exact file or directory named after model_version
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
                "No model_loader provided and no .pth/.pt found in MODEL_DIR"
            )

        resolved_path = str(candidate)
    else:
        loaded = model_loader(model_version)
        # Accept either an nn.Module or a path string; ignore tuple contract
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
            if isinstance(first, (str,)):
                resolved_path = first
            # try to capture labels/preprocess if present
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
        elif isinstance(loaded, (str,)):
            resolved_path = loaded
        else:
            raise ValueError(
                "model_loader returned unsupported type; must be nn.Module or "
                "path str"
            )

    module = None
    if resolved_path is not None:
        # If resolved_path is a relative filename (e.g. stored in DB by
        # `GitModelLoaderImpl`), try to resolve it under `MODEL_DIR` so we
        # check the mounted models folder (`/app/models`) first.
        rp = Path(resolved_path)
        # Docker mounts models in `/app/models`. For any relative model
        # identifier (filename stored in DB), resolve it under that folder.
        if not rp.is_absolute():
            resolved_path = str(Path("/app/models") / resolved_path)

        # Prefer to try `torch.jit.load` (TorchScript). If it fails due to
        # archive format, fall back to loading a state_dict and building a
        # module.
        try:
            try:
                module = torch.jit.load(resolved_path, map_location=device)
                try:
                    _try_load_sidecar(resolved_path, model_version)
                except FileNotFoundError as e:
                    print(f"[WARN] sidecar not loaded for {resolved_path}: {e}")
            except RuntimeError as e:
                # common message when a state_dict was passed to jit.load
                msg = str(e)
                if any(
                    x in msg
                    for x in (
                        "PytorchStreamReader",
                        "constants.pkl",
                        "unsupported",
                    )
                ):
                    # fallback to state-dict handling
                    module = None
                else:
                    raise
        except Exception:
            module = None

        if module is None:
            # attempt to build from state_dict
            module = _build_module_from_state(resolved_path, device=device)
            try:
                _try_load_sidecar(resolved_path, model_version)
            except FileNotFoundError as e:
                # don't fail when labels are missing; warn and continue
                print(f"[WARN] sidecar not loaded for {resolved_path}: {e}")
            print(
                f"[MODEL][LOAD] model_version={model_version} "
                f"labels_cached={model_version in LABELS_CACHE}"
            )

    if module is None:
        raise ValueError(
            "Unable to load model for version %s" % model_version
        )

    module.to(device)
    module.eval()

    MODEL_CACHE[model_version] = module
    return module


def _postprocess_logits(
    logits: torch.Tensor,
    top_k: int = 3,
) -> Tuple[List[int], List[float]]:
    # logits expected shape (1, num_classes)
    probs = torch.softmax(logits, dim=1)
    topk = torch.topk(probs, k=min(top_k, probs.shape[1]), dim=1)
    indices = topk.indices[0].tolist()
    scores = topk.values[0].tolist()
    return indices, scores


def predict_image(
    image_bytes: bytes,
    catalog: model_catalog.ModelCatalog,
    top_k: int = 3,
    confidence_threshold: float = 0.8,
    labels: Optional[Iterable[str]] = None,
    preprocess_config: Optional[Dict[str, Any]] = None,
    save_callback: Optional[Callable[[bytes, Dict[str, Any]], None]] = None,
    device: Optional[torch.device] = None,
) -> Dict[str, Any]:
    if device is None:
        device = torch.device("cpu")

    start_time = time.time()

    # 🔒 1. Récupération DU modèle actif
    active_model = catalog.find_active_model()
    if active_model is None:
        raise RuntimeError("No active model configured in database")

    model_version = active_model.path  # clé canonique (et chemin fichier)

    # 🔒 2. Chargement du modèle (aucun fallback implicite)
    model = load_model(model_version, device=device)

    # 🔹 labels (cache → override explicite)
    labels_list: Optional[List[str]] = LABELS_CACHE.get(model_version)
    print(
        f"[PREDICT][LABELS] model_version={model_version} "
        f"labels_list={labels_list}"
    )
    if labels is not None:
        labels_list = list(labels)

    # 🔹 preprocess config
    pc = PREPROCESS_CACHE.get(model_version, {}).copy()
    if preprocess_config:
        pc.update(preprocess_config)

    size = pc.get("size", active_model.input_size)
    mean = pc.get("mean")
    std = pc.get("std")

    # 🔹 preprocessing image
    image = open_image_from_bytes(image_bytes)
    tensor = default_preprocess(image, size=size, mean=mean, std=std)
    tensor = tensor.to(device)

    # 🔹 inference
    with torch.no_grad():
        logits = model(tensor)
        if logits.ndim == 1:
            logits = logits.unsqueeze(0)

        indices, scores = _postprocess_logits(logits, top_k=top_k)
        print(
            f"[PREDICT][RAW] indices={indices} scores={scores}"
        )

    # 🔹 mapping indices → labels
    preds: List[Dict[str, Any]] = []
    for idx, score in zip(indices, scores):
        label = str(idx)
        if labels_list is not None and idx < len(labels_list):
            label = labels_list[idx]
        print(
            f"[PREDICT][MAP] idx={idx} -> label={label}"
        )
        preds.append({"label": label, "score": float(score)})

    top_score = preds[0]["score"] if preds else 0.0
    accepted = top_score >= confidence_threshold

    elapsed_ms = (time.time() - start_time) * 1000.0

    result: Dict[str, Any] = {
        "predictions": preds,
        "model_version": model_version,
        "accepted": bool(accepted),
        "time_ms": float(elapsed_ms),
    }

    # 🔹 callback de sauvegarde
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

    # 🔹 champs normalisés top-*
    top_prediction = preds[0] if preds else None
    result["top_prediction"] = top_prediction
    result["top_score"] = float(top_score) if top_prediction else 0.0
    result["top_label"] = top_prediction["label"] if top_prediction else None

    return result


def _try_load_sidecar(path: str, model_version: str) -> None:
    """Load canonical sidecars next to a model file.

    Expects two optional files next to the model file:
    - `<model-stem>-label.json` containing {"classes": [...]}
      - `<model-stem>-preprocess.json` containing preprocess params

    If the label sidecar is missing or malformed this function raises
    `FileNotFoundError` so callers can decide whether to fail or continue.
    """
    print(f"[SIDELOAD][START] model_version={model_version}")
    p = Path(path)
    # Only support the canonical sidecar names placed next to the model
    # file:
    #  - <model-stem>-label.json  -> {"classes": ["A","B",...]}
    #  - <model-stem>-preprocess.json -> preprocess config
    print(
        f"[SIDELOAD] model_version={model_version} path={p}"
    )
    print(
        f"[SIDELOAD] looking for sidecars: "
        f"{p.parent / (p.stem + '-label.json')}, "
        f"{p.parent / (p.stem + '-preprocess.json')}"
    )
    preferred_label = p.parent / (p.stem + "-label.json")

    print(f"[DEBUG] looking for {preferred_label}, exists={preferred_label.is_file()}")
    if preferred_label.is_file():
        try:
            with open(preferred_label, "r") as fh:
                data = json.load(fh)
                if (
                    isinstance(data, dict)
                    and "classes" in data
                    and isinstance(data["classes"], list)
                ):
                    LABELS_CACHE[model_version] = [
                        str(x)
                        for x in data["classes"]
                    ]
                    print(
                        f"[LABELS][LOADED] model_version={model_version} "
                        f"count={len(LABELS_CACHE[model_version])} "
                        f"labels={LABELS_CACHE[model_version]}"
                    )
                else:
                    raise ValueError("label sidecar malformed")
        except Exception as e:
            raise FileNotFoundError(
                "Failed to load label sidecar %s: %s" % (preferred_label, e)
            )

    preferred_preprocess = p.parent / (p.stem + "-preprocess.json")
    if preferred_preprocess.is_file():
        try:
            with open(preferred_preprocess, "r") as fh:
                PREPROCESS_CACHE[model_version] = json.load(fh)
        except Exception:
            # ignore malformed preprocess sidecars
            pass
    # If labels were not loaded, raise to inform caller
    if model_version not in LABELS_CACHE:
        print(
            f"[LABELS][MISSING] model_version={model_version} "
            f"expected={p.parent / (p.stem + '-label.json')}"
        )
        raise FileNotFoundError(
            "Label sidecar not found for model at %s; expected %s"
            % (p, p.parent / (p.stem + "-label.json"))
        )
    print(f"[SIDELOAD][END] labels_loaded={LABELS_CACHE.get(model_version)}")


def _build_module_from_state(
    path: str,
    num_classes: Optional[int] = None,
    device: Optional[torch.device] = None,
    arch: str = "resnet50",
) -> nn.Module:
    """Load a state_dict from `path` and build a backbone model.

    Args:
        path: path to the state_dict (.pth/.pt)
        num_classes: optional number of output classes (overrides inference)
        device: torch.device to place the model on
          arch: architecture name to construct (e.g. "resnet50",
              "efficientnet_b0")
    """
    if device is None:
        device = torch.device("cpu")

    try:
        state = torch.load(path, map_location="cpu")
    except Exception as e:
        raise FileNotFoundError("Cannot load state dict at %s: %s" % (path, e))

    # Accept wrappers that include state_dict
    if isinstance(state, dict):
        if "state_dict" in state:
            state_dict = state["state_dict"]
        elif "model_state" in state:
            state_dict = state["model_state"]
        else:
            state_dict = state
    else:
        raise ValueError("State loaded is not a dict/state_dict")

    # strip DataParallel prefix if present
    new_state = {
        k[len("module."):] if k.startswith("module.") else k: v
        for k, v in state_dict.items()
    }

    # infer num_classes from final linear if not provided
    if num_classes is None:
        for k, v in new_state.items():
            if (
                k.endswith("fc.weight")
                or k.endswith("classifier.1.weight")
                or "fc.weight" in k
            ):
                try:
                    num_classes = int(v.shape[0])
                    break
                except Exception:
                    continue

    # build model according to requested arch
    try:
        from torchvision import models

        if arch == "resnet50":
            try:
                model = models.resnet50(weights=None)
            except Exception:
                model = models.resnet50(pretrained=False)
        elif arch == "efficientnet_b0":
            try:
                model = models.efficientnet_b0(weights=None)
            except Exception:
                model = models.efficientnet_b0(pretrained=False)
        else:
            raise ValueError("Architecture %s not supported" % arch)

        # replace final layer if num_classes known
        if num_classes is not None:
            if (
                arch.startswith("resnet")
                and hasattr(model, "fc")
                and isinstance(model.fc, nn.Linear)
            ):
                in_feat = model.fc.in_features
                model.fc = nn.Linear(in_feat, num_classes)
            elif (
                arch.startswith("efficientnet")
                and hasattr(model, "classifier")
            ):
                # EfficientNet classifier is usually Sequential/Linear
                try:
                    if (
                        isinstance(model.classifier, nn.Sequential)
                        and isinstance(model.classifier[-1], nn.Linear)
                    ):
                        in_feat = model.classifier[-1].in_features
                        model.classifier[-1] = nn.Linear(in_feat, num_classes)
                    elif isinstance(model.classifier, nn.Linear):
                        in_feat = model.classifier.in_features
                        model.classifier = nn.Linear(in_feat, num_classes)
                except Exception:
                    pass

        # load state dict and return
        model.load_state_dict(new_state, strict=False)
        model.to(device)
        model.eval()
        return model
    except Exception as e:
        raise RuntimeError(
            "Failed to build %s and load state_dict: %s" % (arch, e)
        )
