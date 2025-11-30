from abc import ABC, abstractmethod
from app.model.domain.catalog.model_catalog import ModelCatalog


class ModelLoader(ABC):
    """
    Interface (port) pour un chargeur de modèles.

    Les implémentations concrètes doivent fournir la méthode `scan_and_load()`.
    """

    def __init__(self, model_catalog: ModelCatalog):
        self.catalog = model_catalog

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
        raise NotImplementedError()
