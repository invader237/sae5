from pydantic import BaseModel
from typing import Optional
from typing import Literal


class PictureImportDTO(BaseModel):
    sendType: Optional[Literal["analyse", "database"]] = None
