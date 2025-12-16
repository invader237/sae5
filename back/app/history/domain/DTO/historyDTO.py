from datetime import datetime
from pydantic import BaseModel
from uuid import UUID

from app.model.domain.DTO.modelLightDTO import ModelLightDTO


class HistoryDTO(BaseModel):
    id: UUID
    image_id: UUID | None = None
    room_name: str | None = None
    scanned_at: datetime
    model: ModelLightDTO | None = None

    class Config:
        from_attributes = True
