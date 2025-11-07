from sqlalchemy.orm import session
from fastapi import Depends

from app.room.infra.repository.room_repository import RoomRepository
from app.room.infra.repository.room_sqlalchemy_adapter import (
    RoomSQLAlchemyAdapter,
)
from app.room.domain.catalog.room_catalog import RoomCatalog
from app.database import get_session


def get_room_catalog(db: session = Depends(get_session)) -> RoomCatalog:
    repo = RoomRepository(db)
    return RoomSQLAlchemyAdapter(repo)
