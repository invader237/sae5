from pydantic import BaseModel
from typing import Literal
from app.room.domain.DTO.roomLightDTO import RoomLightDTO

class ModelTrainingDTO(BaseModel):
    type: Literal["base", "scratch"]
    epochs: int
    batchSize: int
    learningRate: float
    roomList: list[RoomLightDTO]
