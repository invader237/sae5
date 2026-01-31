from __future__ import annotations

from pydantic import BaseModel, Field

from app.room.domain.DTO.roomLightDTO import RoomLightDTO
from app.model.domain.DTO.confusionMatrixCellDTO import ConfusionMatrixCellDTO
from app.model.domain.DTO.accuracyOverTimePointDTO import AccuracyOverTimePointDTO


class ModelStatsDetailedDTO(BaseModel):
    rooms: list[RoomLightDTO] = Field(default_factory=list)
    confusion_matrix: list[ConfusionMatrixCellDTO] = Field(
        default_factory=list
    )
    accuracy_global: float = 0.0
    accuracy_over_time: list[AccuracyOverTimePointDTO] = Field(
        default_factory=list
    )
