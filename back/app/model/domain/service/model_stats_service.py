from __future__ import annotations

from uuid import UUID

from app.model.domain.catalog.model_stats_catalog import ModelStatsCatalog
from app.model.domain.DTO.modelStatsDetailedDTO import ModelStatsDetailedDTO
from app.model.domain.DTO.modelStatsSummaryDTO import ModelStatsSummaryDTO
from app.model.domain.DTO.confusionMatrixCellDTO import ConfusionMatrixCellDTO
from app.model.domain.DTO.accuracyOverTimePointDTO import AccuracyOverTimePointDTO
from app.room.domain.catalog.room_catalog import RoomCatalog
from app.room.domain.mapper.room_to_roomLightDTO_mapper import (
    room_to_roomLightDTO_mapper,
)


class ModelStatsService:
    def __init__(
        self,
        model_stats_catalog: ModelStatsCatalog,
        room_catalog: RoomCatalog,
    ):
        self.model_stats_catalog = model_stats_catalog
        self.room_catalog = room_catalog

    def get_summary(self, model_id: UUID) -> ModelStatsSummaryDTO:
        """2 KPIs: validated images count + average score (%)."""
        validated_images, avg_score = (
            self.model_stats_catalog.count_validated_images_with_avg_score(
                model_id
            )
        )
        return ModelStatsSummaryDTO(
            validated_images=validated_images,
            avg_score=avg_score,
        )

    def get_detailed(self, model_id: UUID) -> ModelStatsDetailedDTO:
        """Heavy analytics for the modal (computed on demand)."""

        # Confusion matrix data
        cm_data = self.model_stats_catalog.get_confusion_matrix_data(model_id)
        confusion_matrix = [
            ConfusionMatrixCellDTO(
                actual_room_id=actual_id,
                predicted_room_id=predicted_id,
                count=count,
            )
            for actual_id, predicted_id, count in cm_data
        ]

        # Rooms involved in matrix
        room_ids = self.model_stats_catalog.get_room_ids_for_model(model_id)
        rooms = []
        if room_ids:
            room_entities = self.room_catalog.find_by_ids(list(room_ids))
            rooms = [
                room_to_roomLightDTO_mapper.apply(r) for r in room_entities
            ]

        # Global accuracy
        total, correct = self.model_stats_catalog.get_global_accuracy(model_id)
        accuracy_global = float(correct / total) if total > 0 else 0.0

        # Accuracy over time
        time_data = self.model_stats_catalog.get_accuracy_over_time(model_id)
        accuracy_over_time = [
            AccuracyOverTimePointDTO(
                bucket=bucket,
                accuracy=float(row_correct / row_total)
                if row_total > 0
                else 0.0,
                total=row_total,
                correct=row_correct,
            )
            for bucket, row_total, row_correct in time_data
        ]

        return ModelStatsDetailedDTO(
            rooms=rooms,
            confusion_matrix=confusion_matrix,
            accuracy_global=accuracy_global,
            accuracy_over_time=accuracy_over_time,
        )
