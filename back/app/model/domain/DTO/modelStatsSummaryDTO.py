from pydantic import BaseModel


class ModelStatsSummaryDTO(BaseModel):
    validated_images: int = 0
    avg_score: float = 0.0
