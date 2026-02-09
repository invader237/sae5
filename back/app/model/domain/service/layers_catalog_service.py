import json
from pathlib import Path
from typing import Any


LAYERS_CATALOG_PATH = Path(__file__).parent.parent / "layers_catalog.json"


class LayersCatalogService:
    """Service qui charge et expose le catalogue de couches PyTorch."""

    def __init__(self):
        self._catalog: list[dict[str, Any]] = []
        self._load_catalog()

    def _load_catalog(self):
        with open(LAYERS_CATALOG_PATH, "r", encoding="utf-8") as f:
            self._catalog = json.load(f)

    def get_all_layers(self) -> list[dict[str, Any]]:
        """Retourne la liste complète des couches disponibles."""
        return self._catalog

    def get_layer_by_type(self, layer_type: str) -> dict[str, Any] | None:
        """Retourne la définition d'une couche par son type."""
        for layer in self._catalog:
            if layer["type"] == layer_type:
                return layer
        return None

    def get_valid_types(self) -> list[str]:
        """Retourne la liste des types de couches valides."""
        return [layer["type"] for layer in self._catalog]
