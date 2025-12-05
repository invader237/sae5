from datetime import datetime
from pydantic import BaseModel
from uuid import UUID


class HistoryDTO(BaseModel):
    id: UUID
    picture_id: UUID | None = None
    image_path: str
    room_name: str | None
    scanned_at: datetime

    class Config:
        from_attributes = True
