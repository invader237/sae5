import os
from typing import Collection, Optional, Union
from pathlib import Path

from app.model.domain.service.model_loader import ModelLoader
from app.model.domain.catalog.model_catalog import ModelCatalog
from app.model.domain.entity.model import Model


class GitModelLoaderImpl(ModelLoader):
    """
    Implémentation de ModelLoader pour un dépôt Git.
    Réutilise la logique métier pour scanner un répertoire local de modèles.
    """

    def __init__(
        self,
        model_catalog: ModelCatalog,
        models_dir: str = r"/app/models",
    ):
        super().__init__(model_catalog)
        # Répertoire à scanner pour les fichiers .pth
        self.models_dir = models_dir

    def scan_and_load(self) -> None:
        """
        Scanne le répertoire et ajoute les modèles absents via ModelCatalog.
        Exactement la même logique que dans ton ancien ModelLoader.
        """
        existing_models: Collection[Model] = self.catalog.find_all()
        existing_models_dict = {m.name: m for m in existing_models}

        if not os.path.isdir(self.models_dir):
            print(
                f"[WARN] Dossier des modèles introuvable : {self.models_dir}"
            )
            return

        for filename in os.listdir(self.models_dir):
            if not (filename.endswith(".pth") or filename.endswith(".pt")):
                continue

            model_name = os.path.splitext(filename)[0]
            # Store only the filename as the model path so the DB entry
            # references the model file name (the application uses
            # `MODEL_DIR` to locate files on disk at runtime).
            model_path = filename

            # Modèle existant → rien à faire
            if model_name in existing_models_dict:
                print(f"[SKIP] Modèle déjà enregistré : {model_name}")
                continue

            # Nouveau modèle
            new_model = Model(
                name=model_name,
                path=model_path,
                is_active=False,
            )

            self.catalog.save(new_model)
            print(f"[ADD] Nouveau modèle ajouté : {model_name}")

        print("Scan terminé.")

    def __call__(
        self,
        model_version: Optional[str] = None,
    ) -> Union[str, tuple]:
        """Resolve a logical model version and, when possible, load local .pth
        checkpoints into an `nn.Module` instance.

        This method intentionally performs local-file-specific work (path
        resolution, `torch.load`, optional construction of a torchvision
        model). Keeping this in the implementation avoids importing heavy
        ML deps in the interface.
        """
        # Resolve the Model entity (same resolution logic as the base
        # interface previously used). We need the `Model` to build the
        # preprocess config and to inspect the model name.
        model: Optional[Model] = None
        if model_version is None:
            model = self.catalog.find_active_model()
        else:
            try:
                model = self.catalog.find_by_id(model_version)
            except Exception:
                model = None

            if model is None:
                all_models = self.catalog.find_all()
                for m in all_models:
                    if m.name == model_version:
                        model = m
                        break

        if model is None:
            raise FileNotFoundError(
                f"Model not found for version/name: {model_version}"
                )

        preprocess_config = {"size": getattr(model, "input_size", 384)}
        path = model.path
        labels = None

        # If this is a local checkpoint, attempt to load and construct a
        # module for common cases (e.g. resnet). Fall back to returning the
        # path so callers can load it themselves.
        if isinstance(path, str) and path.lower().endswith((".pth", ".pt")):
            rp = Path(path)
            resolved = path
            if not rp.is_absolute():
                candidate = Path(self.models_dir) / path
                if candidate.exists():
                    resolved = str(candidate)

            # Lazy import heavy libs to avoid module-level dependency.
            try:
                import torch
                import torch.nn as nn
            except Exception:
                # If torch is not available, return the path so caller can
                # decide how to handle it.
                return (path, labels, preprocess_config)

            # Attempt to load the checkpoint
            try:
                state = torch.load(resolved, map_location="cpu")
            except Exception as e:
                raise FileNotFoundError(
                    f"Cannot load state dict at {resolved}: {e}"
                    )

            # Unwrap common checkpoint dict wrappers
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
                if k.startswith("module."):
                    new_state[k[len("module."):]] = v
                else:
                    new_state[k] = v

            # try to infer number of output classes from classifier layer
            num_classes = None
            for k, v in new_state.items():
                if (
                    k.endswith("fc.weight")
                    or "classifier.weight" in k
                    or "head.weight" in k
                ):
                    try:
                        num_classes = int(v.shape[0])
                        break
                    except Exception:
                        continue

            # if model name or path mentions resnet, build resnet50
            module = None
            lname = (model.name or "").lower()
            lpath = (resolved or "").lower()
            if "resnet" in lname or "resnet" in lpath:
                try:
                    from torchvision import models as tv_models

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
                    raise RuntimeError(
                        f"Failed to build ResNet50 and load state_dict: {e}"
                        )

            if module is not None:
                return (module, None, preprocess_config)

        return (path, labels, preprocess_config)
