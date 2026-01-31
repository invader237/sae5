from typing import Collection, Union
from uuid import UUID

from app.room.domain.catalog.room_catalog import RoomCatalog
from app.room.infra.repository.room_repository import RoomRepository
from app.room.domain.entity.room import Room as RoomModel


class RoomSQLAlchemyAdapter(RoomCatalog):
    def __init__(self, repository: RoomRepository):
        self.repository = repository

    def find_all(self):
        return self.repository.find_all()

    def save(self, room: RoomModel):
        return self.repository.save(room)

    def find_by_name(self, name: str):
        return self.repository.find_by_name(name)

    def find_by_id(self, room_id: str):
        return self.repository.find_by_id(room_id)

    def find_by_ids(
        self, room_ids: Collection[Union[str, UUID]]
    ) -> Collection[RoomModel]:
        return self.repository.find_by_ids(room_ids)

    def delete(self, room_id: str):
        return self.repository.delete(room_id)

    def low_picture_coverage_rooms(self):
        return self.repository.low_picture_coverage_rooms()

    def total_rooms_count(self):
        return self.repository.total_rooms_count()

    def find_all_validated(self):
        return self.repository.find_all_validated()

    def find_rooms_with_validated_pictures(self):
        return self.repository.find_rooms_with_validated_pictures()
