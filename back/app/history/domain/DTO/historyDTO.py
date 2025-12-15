from datetime import datetime
from pydantic import BaseModel
from uuid import UUID


class HistoryDTO(BaseModel):
    id: UUID
    image_id: UUID | None = None
    room_name: str | None
    scanned_at: datetime
    model_id: UUID | None = None
    model_name: str | None = None

    class Config:
        from_attributes = True
