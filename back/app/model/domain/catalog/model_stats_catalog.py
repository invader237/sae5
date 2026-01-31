from __future__ import annotations

from typing import Protocol, Collection, Tuple
from uuid import UUID
from datetime import date


class ModelStatsCatalog(Protocol):
    """Protocol for model statistics data access."""

    def count_validated_images_with_avg_score(
        self,
        model_id: UUID,
    ) -> Tuple[int, float]:
        """
        Returns (validated_images_count, avg_score) for a model.
        """
        ...

    def get_confusion_matrix_data(
        self,
        model_id: UUID,
    ) -> Collection[Tuple[UUID, UUID, int]]:
        """
        Returns confusion matrix data as (actual_room_id, predicted_room_id, count).
        """
        ...

    def get_room_ids_for_model(
        self,
        model_id: UUID,
    ) -> Collection[UUID]:
        """
        Returns all room IDs (actual and predicted) involved in validated predictions.
        """
        ...

    def get_global_accuracy(
        self,
        model_id: UUID,
    ) -> Tuple[int, int]:
        """
        Returns (total_predictions, correct_predictions).
        """
        ...

    def get_accuracy_over_time(
        self,
        model_id: UUID,
    ) -> Collection[Tuple[date, int, int]]:
        """
        Returns daily accuracy data as (date, total, correct).
        """
        ...
