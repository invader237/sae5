from pydantic import BaseModel


class ScratchLayersDTO(BaseModel):
    """Selection couches pour entraînement From Scratch"""
    conv1: bool = True
    conv2: bool = True
    pooling: bool = True
    fc1: bool = True
    dropout: bool = False
