from __future__ import annotations

from uuid import UUID

from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.history.domain.entity.history import History as HistoryModel
from app.model.domain.DTO.modelStatsDetailedDTO import (
    AccuracyOverTimePointDTO,
    ConfusionMatrixCellDTO,
    ModelStatsDetailedDTO,
)
from app.model.domain.DTO.modelStatsSummaryDTO import ModelStatsSummaryDTO
from app.picture.domain.entity.picture import Picture as PictureModel
from app.room.domain.entity.room import Room as RoomModel
from app.room.domain.mapper.room_to_roomLightDTO_mapper import (
    room_to_roomLightDTO_mapper,
)


class ModelStatsService:
    def __init__(self, db: Session):
        self.db = db

    def get_summary(self, model_id: UUID) -> ModelStatsSummaryDTO:
        """2 KPIs for quick cards: validated images count + average score (%)."""

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
        return ModelStatsSummaryDTO(
            validated_images=int(validated_images),
            avg_score=float(avg_score or 0.0),
        )

    def get_detailed(self, model_id: UUID) -> ModelStatsDetailedDTO:
        """Heavy analytics for the modal (computed on demand)."""

        base_filter = [
            HistoryModel.model_id == model_id,
            PictureModel.is_validated.is_(True),
            HistoryModel.room_id.isnot(None),
            PictureModel.room_id.isnot(None),
        ]

        # Confusion matrix: actual (validated picture room) vs predicted (history room)
        cm_rows = (
            self.db.query(
                PictureModel.room_id.label("actual_room_id"),
                HistoryModel.room_id.label("predicted_room_id"),
                func.count().label("count"),
            )
            .join(
                HistoryModel,
                HistoryModel.image_id == PictureModel.image_id,
            )
            .filter(*base_filter)
            .group_by(PictureModel.room_id, HistoryModel.room_id)
            .all()
        )

        confusion_matrix = [
            ConfusionMatrixCellDTO(
                actual_room_id=row.actual_room_id,
                predicted_room_id=row.predicted_room_id,
                count=int(row.count or 0),
            )
            for row in cm_rows
        ]

        # Rooms involved in matrix (union actual/predicted)
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

        rooms = []
        if room_ids:
            room_entities = (
                self.db.query(RoomModel)
                .filter(RoomModel.room_id.in_(list(room_ids)))
                .order_by(RoomModel.name.asc())
                .all()
            )
            rooms = [room_to_roomLightDTO_mapper.apply(r) for r in room_entities]

        # Accuracy global
        acc_row = (
            self.db.query(
                func.count().label("total"),
                func.sum(
                    case(
                        (
                            HistoryModel.room_id == PictureModel.room_id,
                            1,
                        ),
                        else_=0,
                    )
                ).label("correct"),
            )
            .join(
                HistoryModel,
                HistoryModel.image_id == PictureModel.image_id,
            )
            .filter(*base_filter)
            .one()
        )

        total = int(acc_row.total or 0)
        correct = int(acc_row.correct or 0)
        accuracy_global = float(correct / total) if total > 0 else 0.0

        # Accuracy evolution over time (daily buckets)
        bucket = func.date(HistoryModel.scanned_at)
        series_rows = (
            self.db.query(
                bucket.label("bucket"),
                func.count().label("total"),
                func.sum(
                    case(
                        (
                            HistoryModel.room_id == PictureModel.room_id,
                            1,
                        ),
                        else_=0,
                    )
                ).label("correct"),
            )
            .join(
                PictureModel,
                HistoryModel.image_id == PictureModel.image_id,
            )
            .filter(*base_filter)
            .group_by(bucket)
            .order_by(bucket.asc())
            .all()
        )

        accuracy_over_time: list[AccuracyOverTimePointDTO] = []
        for row in series_rows:
            row_total = int(row.total or 0)
            row_correct = int(row.correct or 0)
            accuracy_over_time.append(
                AccuracyOverTimePointDTO(
                    bucket=row.bucket,
                    accuracy=float(row_correct / row_total)
                    if row_total > 0
                    else 0.0,
                    total=row_total,
                    correct=row_correct,
                )
            )

        return ModelStatsDetailedDTO(
            rooms=rooms,
            confusion_matrix=confusion_matrix,
            accuracy_global=accuracy_global,
            accuracy_over_time=accuracy_over_time,
        )
