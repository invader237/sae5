import os
import hashlib
from typing import Collection
from app.model.domain.catalog.model_catalog import ModelCatalog
from app.model.domain.entity.model import Model


class ModelLoader:
    """
    Service métier : scanne un répertoire de modèles IA et synchronise la DB.
    """

    def __init__(self, model_catalog: ModelCatalog):
        self.catalog = model_catalog
        self.models_dir = r"/app/models"

    def _compute_hash(self, file_path: str) -> str:
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    def scan_and_load(self):
        """
        Scanne le répertoire et ajoute les modèles absents via ModelCatalog.
        """
        existing_models: Collection[Model] = self.catalog.find_all()
        existing_models_dict = {m.name: m for m in existing_models}

        for filename in os.listdir(self.models_dir):
            if not filename.endswith(".pth"):
                continue

            model_name = os.path.splitext(filename)[0]
            model_path = os.path.join(self.models_dir, filename)

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
