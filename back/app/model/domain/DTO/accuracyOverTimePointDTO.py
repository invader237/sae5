from __future__ import annotations

from datetime import date

from pydantic import BaseModel


class AccuracyOverTimePointDTO(BaseModel):
    bucket: date
    accuracy: float
    total: int
    correct: int
