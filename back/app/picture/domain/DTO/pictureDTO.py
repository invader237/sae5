from __future__ import annotations

from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


class PictureDTO(BaseModel):
    id: Optional[UUID] = None
    path: Optional[str] = None
    analyse_by: Optional[str] = None
    pourcentage: Optional[float] = None
    date_detection: Optional[datetime] = None
    date_validation: Optional[datetime] = None
