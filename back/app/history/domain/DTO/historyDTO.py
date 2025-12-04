from datetime import datetime
from pydantic import BaseModel
from uuid import UUID


class HistoryDTO(BaseModel):
    id: UUID
    image_path: str
    room_name: str | None
    scanned_at: datetime

    class Config:
        from_attributes = True
