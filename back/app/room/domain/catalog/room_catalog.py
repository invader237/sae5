from typing import Protocol, Collection
from app.room.domain.entity.room import Room


class RoomCatalog(Protocol):
    def find_all(self) -> Collection[Room]: ...
    def save(self, room: Room) -> None: ...
