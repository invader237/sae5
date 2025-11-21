from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class PictureDTO(BaseModel):
    id: Optional[UUID] = None
    path: Optional[str] = None
