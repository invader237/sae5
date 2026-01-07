from typing import Union, Collection
from uuid import UUID
from app.picture.domain.entity.picture import Picture
from app.picture.domain.catalog.picture_catalog import PictureCatalog
from app.picture.infra.repository.picture_repository import PictureRepository
from app.room.domain.entity.room import Room


class PictureSQLAlchemyAdapter(PictureCatalog):
    def __init__(self, repository: PictureRepository):
        self.repository = repository

    def find_all(self):
        return self.repository.find_all()

    def save(self, picture: Picture):
        return self.repository.save(picture)

    def find_by_id(self, picture_id: Union[str, UUID]):
        return self.repository.find_by_id(picture_id)

    def find_all_validated_by_room_ids(self, rooms: Collection[Room]):
        return self.repository.find_all_validated_by_room_ids(rooms)

    def find_by_not_validated(self, limit: int = 10, offset: int = 0):
        return self.repository.find_by_not_validated(limit, offset)

    def find_validated_by_room_id(
        self,
        room_id: Union[str, UUID],
        limit: int = 500,
        offset: int = 0,
    ):
        return self.repository.find_validated_by_room_id(
            room_id=room_id,
            limit=limit,
            offset=offset,
        )

    def delete(self, picture_id: Union[str, UUID]):
        return self.repository.delete(picture_id)
