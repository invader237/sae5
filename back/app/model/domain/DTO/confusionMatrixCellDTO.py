from __future__ import annotations

from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ConfusionMatrixCellDTO(BaseModel):
    actual_room_id: Optional[UUID] = None
    predicted_room_id: Optional[UUID] = None
    count: int = 0
