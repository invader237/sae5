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

    def save(self, history_in: dict) -> HistoryModel:
        h = HistoryModel(**history_in)
        self.db.add(h)
        self.db.commit()
        self.db.refresh(h)
        return h
