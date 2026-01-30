from __future__ import annotations

from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.room.domain.DTO.roomLightDTO import RoomLightDTO


class ConfusionMatrixCellDTO(BaseModel):
    actual_room_id: Optional[UUID] = None
    predicted_room_id: Optional[UUID] = None
    count: int = 0


class AccuracyOverTimePointDTO(BaseModel):
    bucket: date
    accuracy: float
    total: int
    correct: int


class ModelStatsDetailedDTO(BaseModel):
    rooms: list[RoomLightDTO] = Field(default_factory=list)
    confusion_matrix: list[ConfusionMatrixCellDTO] = Field(
        default_factory=list
    )
    accuracy_global: float = 0.0
    accuracy_over_time: list[AccuracyOverTimePointDTO] = Field(
        default_factory=list
    )
