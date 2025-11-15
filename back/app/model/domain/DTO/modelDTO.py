from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class ModelDTO(BaseModel):
    id: Optional[UUID] = None
    name: Optional[str] = None
    path: Optional[str] = None
    is_active: Optional[bool] = None
