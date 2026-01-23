from __future__ import annotations

from uuid import UUID

from app.model.domain.DTO.modelStatsDetailedDTO import ModelStatsDetailedDTO
from app.model.domain.DTO.modelStatsSummaryDTO import ModelStatsSummaryDTO


class ModelStatsService:
    def get_summary(self, model_id: UUID) -> ModelStatsSummaryDTO:
        """Contract only (commit 2): implemented in later commit."""
        return ModelStatsSummaryDTO(validated_images=0, avg_score=0.0)

    def get_detailed(self, model_id: UUID) -> ModelStatsDetailedDTO:
        """Contract only (commit 2): implemented in later commit."""
        return ModelStatsDetailedDTO(
            rooms=[],
            confusion_matrix=[],
            accuracy_global=0.0,
            accuracy_over_time=[],
        )
