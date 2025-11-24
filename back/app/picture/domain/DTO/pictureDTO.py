from __future__ import annotations

from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


class PictureDTO(BaseModel):
    id: Optional[UUID] = None
    path: Optional[str] = None
    analyzed_by: Optional[str] = None
    recognition_percentage: Optional[float] = None
    analyse_date: Optional[datetime] = None
    validation_date: Optional[datetime] = None
