from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from uuid import UUID

from app.model.domain.DTO.modelDTO import ModelDTO


class HistoryDTO(BaseModel):
    id: UUID
    room_id: Optional[UUID] = None
    image_id: Optional[UUID] = None
    room_name: Optional[str] = None
    scanned_at: datetime
    model: Optional[ModelDTO] = None

