from sqlalchemy.orm import Session
from app.room.domain.entity.room import Room as RoomModel
from app.picture.domain.entity.picture import Picture
from sqlalchemy import func
from typing import Collection


class RoomRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self) -> Collection[RoomModel]:
        return self.db.query(RoomModel).all()

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

    def low_picture_coverage_rooms(self) -> list[RoomModel]:
        threshold = 3
        return (
            self.db.query(RoomModel)
            .outerjoin(RoomModel.pictures)
            .filter(Picture.is_validated)
            .group_by(RoomModel.room_id)
            .having(func.count(Picture.image_id) < threshold)
            .limit(threshold)
            .all()
        )

    def total_rooms_count(self) -> int:
        return self.db.query(RoomModel).count()
