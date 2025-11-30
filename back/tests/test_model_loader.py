from app.model.infra.model_loader.GitModelLoaderImpl import GitModelLoaderImpl
from app.model.domain.entity.model import Model
from unittest.mock import MagicMock
import os


def test_adds_new_pth_model(tmp_path):
    # Arrange ---------------------------------------------------
    models_dir = tmp_path / "models"
    models_dir.mkdir()
    fake_file = models_dir / "modelA.pth"
    fake_file.write_text("dummy")

    catalog = MagicMock()
    catalog.find_all.return_value = []

    # Monkeypatch dossier utilisé par l'implémentation concrète
    ml = GitModelLoaderImpl(catalog)
    ml.models_dir = str(models_dir)

    # Act --------------------------------------------------------
    ml.scan_and_load()

    # Assert -----------------------------------------------------
    catalog.save.assert_called_once()
    saved_arg = catalog.save.call_args[0][0]
    assert isinstance(saved_arg, Model)
    assert saved_arg.name == "modelA"


def test_skip_existing_model(tmp_path):
    models_dir = tmp_path / "models"
    models_dir.mkdir()
    (models_dir / "modelB.pth").write_text("dummy")

    # Fake existing model in DB using a mock
    existing = [Model(name="modelB", path="/does/not/matter", is_active=False)]
    catalog = MagicMock()
    catalog.find_all.return_value = existing

    ml = GitModelLoaderImpl(catalog)
    ml.models_dir = str(models_dir)

    ml.scan_and_load()

    catalog.save.assert_not_called()


def test_ignore_non_pth_files(tmp_path):
    models_dir = tmp_path / "models"
    models_dir.mkdir()
    (models_dir / "readme.txt").write_text("info")
    (models_dir / "script.py").write_text("print")

    catalog = MagicMock()
    catalog.find_all.return_value = []
    ml = GitModelLoaderImpl(catalog)
    ml.models_dir = str(models_dir)

    ml.scan_and_load()

    catalog.save.assert_not_called()
