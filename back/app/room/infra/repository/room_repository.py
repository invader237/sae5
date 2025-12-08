from sqlalchemy.orm import Session
from app.room.domain.entity.room import Room as RoomModel


class RoomRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self):
        return self.db.query(RoomModel).all()

    def save(self, room_in: dict) -> RoomModel:
        room = RoomModel(**room_in)
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
