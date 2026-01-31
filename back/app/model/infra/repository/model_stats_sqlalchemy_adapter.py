from __future__ import annotations

from typing import Collection, Tuple
from uuid import UUID
from datetime import date

from app.model.domain.catalog.model_stats_catalog import ModelStatsCatalog
from app.model.infra.repository.model_stats_repository import (
    ModelStatsRepository,
)


class ModelStatsSQLAlchemyAdapter(ModelStatsCatalog):
    """Adapter implementing ModelStatsCatalog using SQLAlchemy repository."""

    def __init__(self, repository: ModelStatsRepository):
        self.repository = repository

    def count_validated_images_with_avg_score(
        self,
        model_id: UUID,
    ) -> Tuple[int, float]:
        return self.repository.count_validated_images_with_avg_score(model_id)

    def get_confusion_matrix_data(
        self,
        model_id: UUID,
    ) -> Collection[Tuple[UUID, UUID, int]]:
        return self.repository.get_confusion_matrix_data(model_id)

    def get_room_ids_for_model(
        self,
        model_id: UUID,
    ) -> Collection[UUID]:
        return self.repository.get_room_ids_for_model(model_id)

    def get_global_accuracy(
        self,
        model_id: UUID,
    ) -> Tuple[int, int]:
        return self.repository.get_global_accuracy(model_id)

    def get_accuracy_over_time(
        self,
        model_id: UUID,
    ) -> Collection[Tuple[date, int, int]]:
        return self.repository.get_accuracy_over_time(model_id)
