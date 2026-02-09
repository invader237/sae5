from pydantic import BaseModel
from typing import Any


class CustomLayerDTO(BaseModel):
    """Représente une couche custom ajoutée par l'utilisateur."""
    type: str
    params: dict[str, Any] = {}


class CustomLayersDTO(BaseModel):
    """Liste ordonnée de couches pour l'entraînement from scratch custom."""
    layers: list[CustomLayerDTO] = []
