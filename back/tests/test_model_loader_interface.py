from app.model.domain.service.model_loader import ModelLoader
from app.model.domain.entity.model import Model
from unittest.mock import MagicMock
import os
import hashlib


class MinimalLoader(ModelLoader):
    """Petite implémentation utilisée uniquement pour tester le contrat/port.

    Elle respecte la même logique d'arborescence que `GitModelLoaderImpl` :
    - ne scanne que le niveau racine de `models_dir` (pas de récursivité)
    - ne prend en compte que les fichiers terminant par `.pth`
    - n'ajoute que les modèles absents du catalogue
    """

    def __init__(self, model_catalog, models_dir: str):
        super().__init__(model_catalog)
        self.models_dir = models_dir

    def scan_and_load(self) -> None:
        existing = self.catalog.find_all()
        existing_dict = {m.name: m for m in existing}

        if not os.path.isdir(self.models_dir):
            return

        for filename in os.listdir(self.models_dir):
            if not filename.endswith(".pth"):
                continue

            name = os.path.splitext(filename)[0]
            if name in existing_dict:
                continue

            new_model = Model(name=name, path=os.path.join(self.models_dir, filename), is_active=False)
            self.catalog.save(new_model)


def test_compute_hash_matches_sha256(tmp_path):
    f = tmp_path / "file.bin"
    content = b"some test content"
    f.write_bytes(content)

    catalog = MagicMock()
    loader = MinimalLoader(catalog, str(tmp_path))

    expected = hashlib.sha256(content).hexdigest()
    computed = loader._compute_hash(str(f))

    assert computed == expected


def test_scan_adds_only_top_level_pth_files(tmp_path):
    # structure:
    # tmp_path/
    #   model_top.pth  <-- should be detected
    #   notes.txt      <-- ignored
    #   subdir/
    #     nested.pth   <-- should NOT be detected (no recursion)

    (tmp_path / "model_top.pth").write_text("x")
    (tmp_path / "notes.txt").write_text("ignore me")

    sub = tmp_path / "subdir"
    sub.mkdir()
    (sub / "nested.pth").write_text("y")

    catalog = MagicMock()
    catalog.find_all.return_value = []

    loader = MinimalLoader(catalog, str(tmp_path))
    loader.scan_and_load()

    # Should save exactly once for model_top
    catalog.save.assert_called_once()
    saved = catalog.save.call_args[0][0]
    assert isinstance(saved, Model)
    assert saved.name == "model_top"
