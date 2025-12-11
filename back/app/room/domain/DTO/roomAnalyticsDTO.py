from typing import Optional
from uuid import UUID
from app.room.domain.DTO.roomDTO import RoomDTO

from pydantic import BaseModel


class RoomAnalyticsDTO(BaseModel):
    low_coverage: Optional[RoomDTO] = None
    total_rooms: Optional[int] = 0
