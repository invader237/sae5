from sqlalchemy.orm import Session
from app.history.domain.entity.history import History as HistoryModel


class HistoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self):
        return (
            self.db.query(HistoryModel)
            .order_by(HistoryModel.scanned_at.desc())
            .all()
        )

    def find_by_user_id(self, user_id: str):
        return (
            self.db.query(HistoryModel)
            .filter(HistoryModel.user_id == user_id)
            .order_by(HistoryModel.scanned_at.desc())
            .all()
        )

    def save(self, history: HistoryModel) -> HistoryModel:
        """Persist a History entity (not a dict)."""
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history
