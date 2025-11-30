import os
from typing import Collection
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
