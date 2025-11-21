from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from typing import Literal

class PictureImportDTO(BaseModel):
    sendType: Optional[Literal["analyse", "database"]] = None

