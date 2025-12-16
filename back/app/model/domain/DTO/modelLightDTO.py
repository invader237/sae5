from pydantic import BaseModel
from uuid import UUID


class ModelLightDTO(BaseModel):
    id: UUID | None = None
    name: str | None = None

    class Config:
        from_attributes = True
