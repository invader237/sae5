from abc import ABC, abstractmethod
from typing import Optional, Union
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

        # return tuple (path, labels, preprocess_config)
        return (model.path, None, preprocess_config)

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
