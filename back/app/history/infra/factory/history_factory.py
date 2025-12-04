from fastapi import Depends
from sqlalchemy.orm import session

from app.database import get_session
from app.history.infra.repository.history_repository import HistoryRepository


def get_history_catalog(db: session = Depends(get_session)):
    return HistoryRepository(db)
