from __future__ import annotations

from typing import Collection, Tuple
from uuid import UUID
from datetime import date

from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.history.domain.entity.history import History as HistoryModel
from app.picture.domain.entity.picture import Picture as PictureModel


class ModelStatsRepository:
    """Repository for model statistics SQL queries."""

    def __init__(self, db: Session):
        self.db = db

    def count_validated_images_with_avg_score(
        self,
        model_id: UUID,
    ) -> Tuple[int, float]:
        """Returns (validated_images_count, avg_score) for a model."""
        per_picture = (
            self.db.query(
                PictureModel.image_id.label("image_id"),
                func.max(PictureModel.recognition_percentage).label("score"),
            )
            .join(
                HistoryModel,
                HistoryModel.image_id == PictureModel.image_id,
            )
            .filter(HistoryModel.model_id == model_id)
            .filter(PictureModel.is_validated.is_(True))
            .group_by(PictureModel.image_id)
            .subquery()
        )

        validated_images = (
            self.db.query(func.count(per_picture.c.image_id)).scalar() or 0
        )
        avg_score = self.db.query(func.avg(per_picture.c.score)).scalar()

        return int(validated_images), float(avg_score or 0.0)

    def get_confusion_matrix_data(
        self,
        model_id: UUID,
    ) -> Collection[Tuple[UUID, UUID, int]]:
        """Return confusion matrix data.

        Returns (actual_room_id, predicted_room_id, count).
        """
        rows = (
            self.db.query(
                PictureModel.room_id.label("actual_room_id"),
                HistoryModel.room_id.label("predicted_room_id"),
                func.count().label("count"),
            )
            .join(
                HistoryModel,
                HistoryModel.image_id == PictureModel.image_id,
            )
            .filter(HistoryModel.model_id == model_id)
            .filter(PictureModel.is_validated.is_(True))
            .filter(HistoryModel.room_id.isnot(None))
            .filter(PictureModel.room_id.isnot(None))
            .group_by(PictureModel.room_id, HistoryModel.room_id)
            .all()
        )

        return [
            (row.actual_room_id, row.predicted_room_id, int(row.count or 0))
            for row in rows
        ]

    def get_room_ids_for_model(
        self,
        model_id: UUID,
    ) -> Collection[UUID]:
        """Returns all room IDs involved in validated predictions."""
        actual_room_ids = (
            self.db.query(PictureModel.room_id)
            .join(
                HistoryModel,
                HistoryModel.image_id == PictureModel.image_id,
            )
            .filter(HistoryModel.model_id == model_id)
            .filter(PictureModel.is_validated.is_(True))
            .filter(PictureModel.room_id.isnot(None))
            .distinct()
            .all()
        )

        predicted_room_ids = (
            self.db.query(HistoryModel.room_id)
            .join(
                PictureModel,
                HistoryModel.image_id == PictureModel.image_id,
            )
            .filter(HistoryModel.model_id == model_id)
            .filter(PictureModel.is_validated.is_(True))
            .filter(HistoryModel.room_id.isnot(None))
            .distinct()
            .all()
        )

        room_ids = {
            rid for (rid,) in actual_room_ids if rid is not None
        } | {rid for (rid,) in predicted_room_ids if rid is not None}

        return list(room_ids)

    def get_global_accuracy(
        self,
        model_id: UUID,
    ) -> Tuple[int, int]:
        """Returns (total_predictions, correct_predictions)."""
        row = (
            self.db.query(
                func.count(HistoryModel.id).label("total"),
                func.sum(
                    case(
                        (HistoryModel.room_id == PictureModel.room_id, 1),
                        else_=0,
                    )
                ).label("correct"),
            )
            .select_from(HistoryModel)
            .join(
                PictureModel,
                HistoryModel.image_id == PictureModel.image_id,
            )
            .filter(HistoryModel.model_id == model_id)
            .filter(PictureModel.is_validated.is_(True))
            .filter(HistoryModel.room_id.isnot(None))
            .filter(PictureModel.room_id.isnot(None))
            .one()
        )

        return int(row.total or 0), int(row.correct or 0)

    def get_accuracy_over_time(
        self,
        model_id: UUID,
    ) -> Collection[Tuple[date, int, int]]:
        """Returns daily accuracy data as (date, total, correct)."""
        bucket = func.date(PictureModel.validation_date)

        rows = (
            self.db.query(
                bucket.label("bucket"),
                func.count(HistoryModel.id).label("total"),
                func.sum(
                    case(
                        (HistoryModel.room_id == PictureModel.room_id, 1),
                        else_=0,
                    )
                ).label("correct"),
            )
            .select_from(HistoryModel)
            .join(
                PictureModel,
                HistoryModel.image_id == PictureModel.image_id,
            )
            .filter(HistoryModel.model_id == model_id)
            .filter(PictureModel.is_validated.is_(True))
            .filter(HistoryModel.room_id.isnot(None))
            .filter(PictureModel.room_id.isnot(None))
            .filter(PictureModel.validation_date.isnot(None))
            .group_by(bucket)
            .order_by(bucket.asc())
            .all()
        )

        return [
            (row.bucket, int(row.total or 0), int(row.correct or 0))
            for row in rows
        ]
