from typing import Optional
from uuid import UUID
from pydantic import BaseModel
from app.room.domain.DTO.roomLightDTO import (
    RoomLightDTO,
)


class PicturePvaDTO(BaseModel):
    id: Optional[UUID] = None
    path: Optional[str] = None
    recognition_percentage: Optional[float] = None
    room: Optional[RoomLightDTO] = None
