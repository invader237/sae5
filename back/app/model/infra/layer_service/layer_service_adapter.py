import json
from pathlib import Path
from typing import Any


LAYERS_CATALOG_PATH = (
    Path(__file__).parent.parent.parent
    / "domain"
    / "layers_catalog.json"
)


class LayerServiceAdapter:
    """Implémentation du LayersCatalog via fichier JSON."""

    def __init__(self):
        self._catalog: list[dict[str, Any]] = []
        self._load_catalog()

    def _load_catalog(self):
        with open(
            LAYERS_CATALOG_PATH, "r", encoding="utf-8"
        ) as f:
            self._catalog = json.load(f)

    def get_all_layers(self) -> list[dict[str, Any]]:
        """Retourne la liste complète des couches."""
        return self._catalog

    def get_layer_by_type(
        self, layer_type: str
    ) -> dict[str, Any] | None:
        """Retourne une couche par son type."""
        for layer in self._catalog:
            if layer["type"] == layer_type:
                return layer
        return None

    def get_valid_types(self) -> list[str]:
        """Retourne les types de couches valides."""
        return [layer["type"] for layer in self._catalog]
