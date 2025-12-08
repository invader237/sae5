from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class RoomLightDTO(BaseModel):
    id: Optional[UUID] = None
    name: Optional[str] = None
