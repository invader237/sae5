from typing import Collection, Union
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.room.domain.entity.room import Room as RoomModel
from app.picture.domain.entity.picture import Picture


class RoomRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self) -> Collection[RoomModel]:
        return self.db.query(RoomModel).all()

    def find_by_ids(
        self, room_ids: Collection[Union[str, UUID]]
    ) -> Collection[RoomModel]:
        return (
            self.db.query(RoomModel)
            .filter(RoomModel.room_id.in_(list(room_ids)))
            .order_by(RoomModel.name.asc())
            .all()
        )

    def save(self, room: RoomModel) -> RoomModel:
        self.db.add(room)
        self.db.commit()
        self.db.refresh(room)
        return room

    def find_by_name(self, name: str) -> RoomModel:
        return self.db.query(RoomModel).filter(RoomModel.name == name).first()

    def find_by_id(self, room_id: str) -> RoomModel:
        room = self.db.query(RoomModel).get(room_id)
        if room is None:
            raise Exception("Room not found")
        return room

    def delete(self, room_id: str) -> None:
        room = self.find_by_id(room_id)
        self.db.delete(room)
        self.db.commit()

    def low_picture_coverage_rooms(self) -> Collection[RoomModel]:
        picture_count = func.count(Picture.image_id)

        return (
            self.db.query(RoomModel)
            .outerjoin(RoomModel.pictures)
            .group_by(RoomModel.room_id)
            .order_by(picture_count.asc())
            .limit(3)
            .all()
        )

    def total_rooms_count(self) -> int:
        return self.db.query(RoomModel).count()

    def find_all_validated(self) -> Collection[RoomModel]:
        return (
            self.db.query(RoomModel)
            .join(RoomModel.pictures)
            .filter(Picture.is_validated.is_(True))
            .all()
        )

    def find_rooms_with_validated_pictures(self) -> Collection[RoomModel]:
        return (
            self.db.query(RoomModel)
            .join(RoomModel.pictures)
            .filter(Picture.is_validated.is_(True))
            .distinct()
            .all()
        )
