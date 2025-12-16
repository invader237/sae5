from pydantic import BaseModel
from typing import Literal

class ModelTrainingDTO(BaseModel):
    type: Literal["base", "scratch"]
    epochs: int
    batchSize: int
    learningRate: float
