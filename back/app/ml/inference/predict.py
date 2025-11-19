"""Inference utilities for image classification using PyTorch.

Design goals:
- Accept image bytes + model_version + top_k + confidence_threshold.
- If a prediction is accepted (score >= confidence_threshold), call an
  optional `save_callback(image_bytes, metadata)` so the caller controls
  how/where accepted images are persisted.

`model_loader` expected behavior (examples):
- model_loader(model_version) -> torch.nn.Module
  OR
- model_loader(model_version) -> str/Path (path to torch.jit script module)
  OR
- model_loader(model_version) -> (module, labels, preprocess_config)
"""

from __future__ import annotations

import io
import time
import uuid
from typing import Any, Callable, Dict, Iterable, List, Optional, Tuple, Union

import torch

from app.ml.preprocessing.transforms import open_image_from_bytes, default_preprocess

MODEL_CACHE: Dict[str, torch.nn.Module] = {}
LABELS_CACHE: Dict[str, List[str]] = {}
PREPROCESS_CACHE: Dict[str, Dict[str, Any]] = {}


def load_model(model_version: str,
               model_loader: Optional[Callable[[str], Union[torch.nn.Module, str, Tuple[Any, Any, Any]]]] = None,
               device: Optional[torch.device] = None) -> torch.nn.Module:
    
    if device is None:
        device = torch.device("cpu")

    if model_version in MODEL_CACHE:
        return MODEL_CACHE[model_version]

    if model_loader is None:
        raise ValueError("No model_loader provided; cannot resolve model path/version")

    loaded = model_loader(model_version)

    module: Optional[torch.nn.Module] = None

    # support several return shapes
    if isinstance(loaded, torch.nn.Module):
        module = loaded
    elif isinstance(loaded, (str,)):
        # attempt to load TorchScript module from path
        path = loaded
        module = torch.jit.load(path, map_location=device)
    elif isinstance(loaded, tuple) or isinstance(loaded, list):
        # (module | path, labels?, preprocess_config?)
        first = loaded[0]
        labels = None
        preprocess_config = None
        if len(loaded) > 1:
            labels = loaded[1]
        if len(loaded) > 2:
            preprocess_config = loaded[2]

        if isinstance(first, torch.nn.Module):
            module = first
        elif isinstance(first, (str,)):
            module = torch.jit.load(first, map_location=device)

        if labels is not None:
            LABELS_CACHE[model_version] = list(labels)
        if preprocess_config is not None:
            PREPROCESS_CACHE[model_version] = dict(preprocess_config)
    else:
        raise ValueError("model_loader returned unsupported type; must be nn.Module, path str, or tuple")

    if module is None:
        raise ValueError("Unable to load model for version %s" % model_version)

    module.to(device)
    module.eval()

    MODEL_CACHE[model_version] = module
    return module


def _postprocess_logits(logits: torch.Tensor, top_k: int = 3) -> Tuple[List[int], List[float]]:
    # logits expected shape (1, num_classes)
    probs = torch.softmax(logits, dim=1)
    topk = torch.topk(probs, k=min(top_k, probs.shape[1]), dim=1)
    indices = topk.indices[0].tolist()
    scores = topk.values[0].tolist()
    return indices, scores


def predict_image(image_bytes: bytes,
                  model_version: str,
                  top_k: int = 3,
                  confidence_threshold: float = 0.8,
                  model_loader: Optional[Callable[[str], Any]] = None,
                  labels: Optional[Iterable[str]] = None,
                  preprocess_config: Optional[Dict[str, Any]] = None,
                  save_callback: Optional[Callable[[bytes, Dict[str, Any]], None]] = None,
                  device: Optional[torch.device] = None) -> Dict[str, Any]:
    """Run inference on image bytes and return structured result.

    - `model_loader` is required if models are not yet cached and must be
      provided by the caller; it resolves the logical `model_version` to a
      module/path or a tuple (module/path, labels, preprocess_config).
    - `labels` optional: iterable mapping class index -> label string. If
      omitted and model_loader returned labels earlier, those are used. If no
      labels exist, numeric indices are returned as labels.
    - `save_callback` optional: called as save_callback(image_bytes, metadata)
      when the top prediction score >= confidence_threshold. This lets the
      caller decide where/how to persist accepted images (local disk, cloud,
      DB, ...).
    """
    if device is None:
        device = torch.device("cpu")

    start_time = time.time()

    # load model (may raise if no loader provided and not cached)
    model = load_model(model_version, model_loader=model_loader, device=device)

    # possible cached labels/config
    labels_list: Optional[List[str]] = None
    if model_version in LABELS_CACHE:
        labels_list = LABELS_CACHE[model_version]
    if labels is not None:
        labels_list = list(labels)

    # possible preprocess config
    pc = PREPROCESS_CACHE.get(model_version, {})
    if preprocess_config:
        pc.update(preprocess_config)

    # default preprocess params
    size = pc.get("size", 224)
    mean = pc.get("mean", None)
    std = pc.get("std", None)

    # open and preprocess image
    image = open_image_from_bytes(image_bytes)
    tensor = default_preprocess(image, size=size, mean=mean, std=std)
    tensor = tensor.to(device)

    with torch.no_grad():
        logits = model(tensor)
        # ensure logits is a 2D tensor
        if logits.ndim == 1:
            logits = logits.unsqueeze(0)

        indices, scores = _postprocess_logits(logits, top_k=top_k)

    # map indices -> labels
    preds: List[Dict[str, Any]] = []
    for idx, score in zip(indices, scores):
        label = str(idx)
        if labels_list is not None and idx < len(labels_list):
            label = labels_list[idx]
        preds.append({"label": label, "score": float(score)})

    top_score = preds[0]["score"] if preds else 0.0
    accepted = top_score >= confidence_threshold

    elapsed_ms = (time.time() - start_time) * 1000.0

    result = {
        "predictions": preds,
        "model_version": model_version,
        "accepted": bool(accepted),
        "time_ms": float(elapsed_ms),
    }

    # if accepted, call save callback so caller controls storage
    if accepted and save_callback is not None:
        metadata = {
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

    return result