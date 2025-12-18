from typing import Optional
from pydantic import BaseModel
from uuid import UUID


class ModelLightDTO(BaseModel):
    id: Optional[UUID] = None
    name: Optional[str] = None