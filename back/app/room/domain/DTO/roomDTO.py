from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class RoomDTO(BaseModel):
    id: Optional[UUID] = None
    name: Optional[str] = None
    floor: Optional[int] = None
    department: Optional[str] = None
    type: Optional[str] = None
