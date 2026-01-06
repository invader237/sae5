from typing import Protocol, Collection, Union
from uuid import UUID
from app.picture.domain.entity.picture import Picture
from app.room.domain.entity.room import Room


class PictureCatalog(Protocol):
    def find_all(self) -> Collection[Picture]: ...
    def save(self, picture: Picture) -> None: ...
    def find_by_id(self, picture_id: Union[str, UUID]) -> Picture: ...

    def find_all_validated_by_room_ids(
        self,
        rooms: Collection[Room],
    ) -> Collection[Picture]: ...

    def find_by_not_validated(
        self,
        limit: int,
        offset: int,
    ) -> Collection[Picture]: ...

    def find_validated_by_room_id(
        self,
        room_id: Union[str, UUID],
        limit: int,
        offset: int,
    ) -> Collection[Picture]: ...
    def delete(self, picture_id: Union[str, UUID]) -> None: ...
