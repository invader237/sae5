"""Image preprocessing transforms used by the inference pipeline."""

from __future__ import annotations

import io
from typing import Iterable, Optional

from PIL import Image
import torch
import torchvision.transforms as T


def open_image_from_bytes(image_bytes: bytes) -> Image.Image:
    """Open image from raw bytes and convert to RGB."""
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def default_preprocess(image: Image.Image, size: int = 224,
                       mean: Optional[Iterable[float]] = None,
                       std: Optional[Iterable[float]] = None) -> torch.Tensor:
    """Preprocess PIL Image -> torch.Tensor (1, C, H, W).

    Defaults use ImageNet mean/std and resize to `size` (shorter side -> size,
    then center crop). Caller can override with preprocess_config.
    """
    if mean is None:
        mean = (0.485, 0.456, 0.406)
    if std is None:
        std = (0.229, 0.224, 0.225)

    transforms = T.Compose([
        T.Resize(size),
        T.CenterCrop(size),
        T.ToTensor(),
        T.Normalize(mean=mean, std=std),
    ])
    tensor = transforms(image)
    return tensor.unsqueeze(0)  # add batch dim
