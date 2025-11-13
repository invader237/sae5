import os
import hashlib
from sqlalchemy.orm import Session
from app.model.domain.catalog.model_catalog import ModelCatalog
from typing import Collection
from app.model.domain.entity.model import Model


class ModelLoader:
    """
    Classe pour scanner un répertoire de modèles IA et les charger en DB via SQLAlchemy.
    """

    def __init__(self, model_catalog: ModelCatalog):
        self.catalog = model_catalog
        self.models_dir = r"/app/recognition_model"

    def _compute_hash(self, file_path: str) -> str:
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    def scan_and_load(self):
        """
        Scanne le répertoire et ajoute les modèles absents ou mis à jour via le ModelCatalog.
        """
        existing_models: Collection[Model] = self.catalog.find_all()
        existing_models_dict = {m.name: m for m in existing_models}

        for filename in os.listdir(self.models_dir):
            if not filename.endswith(".pth"):
                continue

            model_name = os.path.splitext(filename)[0]
            model_path = os.path.join(self.models_dir, filename)
            file_hash = self._compute_hash(model_path)

            if model_name in existing_models_dict:
                model_obj = existing_models_dict[model_name]
                if getattr(model_obj, "hash", None) != file_hash:
                    model_obj.path = model_path
                    model_obj.hash = file_hash
                    self.catalog.save(model_obj.__dict__)
                    print(f"[UPDATE] Modèle existant mis à jour : {model_name}")
                else:
                    print(f"[SKIP] Modèle déjà à jour : {model_name}")
                continue

            # Nouveau modèle
            new_model = {
                "name": model_name,
                "path": model_path,
            }
            self.catalog.save(new_model)
            print(f"[ADD] Modèle ajouté : {model_name}")

        print("Scan terminé.")
