from abc import ABC, abstractmethod
from typing import Optional, Union
from typing import Optional, Union
import torch
from torch import nn
from app.model.domain.catalog.model_catalog import ModelCatalog
from app.model.domain.entity.model import Model


class ModelLoader(ABC):
    """
    Interface (port) pour un chargeur de modèles.

    Les implémentations concrètes doivent fournir la méthode `scan_and_load()`.
    """

    def __init__(self, model_catalog: ModelCatalog):
        self.catalog = model_catalog

    def __call__(self, model_version: Optional[str] = None) -> Union[str, tuple]:
        """Resolve a logical model_version to a loader return value.

        Returns either:
          - path (str) to the model file, or
          - tuple(path, labels, preprocess_config)

        `model_version` can be a model name, a model_id (UUID string), or
        None to request the currently active model.
        """
        # find by id
        model: Optional[Model] = None
        if model_version is None:
            model = self.catalog.find_active_model()
        else:
            # try find by id
            try:
                model = self.catalog.find_by_id(model_version)
            except Exception:
                model = None

            # if not found by id, search by name
            if model is None:
                all_models = self.catalog.find_all()
                for m in all_models:
                    if m.name == model_version:
                        model = m
                        break

        if model is None:
            raise FileNotFoundError(f"Model not found for version/name: {model_version}")

        # build preprocess config from model entity
        preprocess_config = {"size": getattr(model, "input_size", 384)}

        path = model.path
        if isinstance(path, str) and path.lower().endswith(".pth"):
            # try to load state_dict and build a module for common cases
            try:
                state = torch.load(path, map_location="cpu")
            except Exception as e:
                raise FileNotFoundError(f"Cannot load state dict at {path}: {e}")

            # unwrap common checkpoint dict wrappers
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
            new_state = {}
            for k, v in state_dict.items():
                new_key = k
                if new_key.startswith("module."):
                    new_key = new_key[len("module."):]
                new_state[new_key] = v

            # try to infer number of output classes from classifier layer
            num_classes = None
            for k, v in new_state.items():
                if k.endswith("fc.weight") or "classifier.weight" in k or "head.weight" in k:
                    try:
                        num_classes = v.shape[0]
                        break
                    except Exception:
                        continue

            # Simple heuristic: if model name or path mentions resnet, build resnet50
            module = None
            lname = (model.name or "").lower()
            lpath = (path or "").lower()
            if "resnet" in lname or "resnet" in lpath:
                try:
                    # import here to avoid hard dependency at module import time
                    from torchvision import models as tv_models

                    # instantiate resnet50 and replace final fc if we detected classes
                    try:
                        base = tv_models.resnet50(weights=None)
                    except Exception:
                        base = tv_models.resnet50(pretrained=False)

                    if num_classes is not None:
                        in_feat = base.fc.in_features
                        base.fc = nn.Linear(in_feat, int(num_classes))

                    base.load_state_dict(new_state, strict=False)
                    module = base
                except Exception as e:
                    raise RuntimeError(f"Failed to build ResNet50 and load state_dict: {e}")

            if module is not None:
                return (module, None, preprocess_config)

        # default: return tuple (path, labels, preprocess_config)
        return (path, None, preprocess_config)

    def _compute_hash(self, file_path: str) -> str:
        """
        Calcule le hash SHA-256 d'un fichier.
        """
        import hashlib

        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    @abstractmethod
    def scan_and_load(self) -> None:
        """
        Scanner la source de modèles et synchroniser la couche applicative.
        """
        pass
