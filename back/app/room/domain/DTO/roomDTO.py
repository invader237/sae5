from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class RoomDTO(BaseModel):
    id: Optional[UUID] = None
    name: Optional[str] = None
    floor: Optional[int] = None
    departement: Optional[str] = None
    type: Optional[str] = None
    validated_picture_count: Optional[int] = 0
