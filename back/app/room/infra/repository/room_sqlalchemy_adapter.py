from app.room.domain.catalog.room_catalog import RoomCatalog
from app.room.infra.repository.room_repository import RoomRepository


class RoomSQLAlchemyAdapter(RoomCatalog):
    def __init__(self, repository: RoomRepository):
        self.repository = repository

    def find_all(self):
        return self.repository.find_all()

    def save(self, room_in: dict):
        return self.repository.save(room_in)

    def find_by_name(self, name: str):
        return self.repository.find_by_name(name)
