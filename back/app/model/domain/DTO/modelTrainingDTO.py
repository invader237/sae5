from pydantic import BaseModel
from typing import Literal, Optional
from app.room.domain.DTO.roomLightDTO import RoomLightDTO
from app.model.domain.DTO.scratchLayersDTO import ScratchLayersDTO


class ModelTrainingDTO(BaseModel):
    type: Literal["base", "scratch"]
    epochs: int
    batchSize: int
    learningRate: float
    roomList: list[RoomLightDTO]
    scratchLayers: Optional[ScratchLayersDTO] = None
