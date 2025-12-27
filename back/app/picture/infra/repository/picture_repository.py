from sqlalchemy.orm import Session
from typing import Union
from uuid import UUID
from app.picture.domain.entity.picture import Picture as PictureModel


class PictureRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self):
        return self.db.query(PictureModel).all()

    def save(self, picture: PictureModel) -> PictureModel:
        self.db.add(picture)
        self.db.commit()
        self.db.refresh(picture)
        return picture

    def find_by_id(self, picture_id: Union[str, UUID]) -> PictureModel:
        lookup_id = picture_id
        if isinstance(picture_id, str):
            try:
                lookup_id = UUID(picture_id)
            except ValueError:
                lookup_id = picture_id

        picture = self.db.query(PictureModel).get(lookup_id)
        if picture is None:
            raise Exception("Picture not found")
        return picture

    def find_all_validated_by_room_ids(self, rooms):
        print("[DEBUG][picture_catalog] rooms:", rooms)
        print("[DEBUG][picture_catalog] rooms type:", type(rooms))

        if not rooms:
            print("[DEBUG][picture_catalog] empty rooms list")
            return []

        room_ids = []
        for room in rooms:
            print(
                "[DEBUG][picture_catalog] room:",
                room,
                "id:",
                room.room_id,
            )
            room_ids.append(room.room_id)

        print("[DEBUG][picture_catalog] room_ids:", room_ids)

        return (
            self.db.query(PictureModel)
            .filter(
                PictureModel.room_id.in_(room_ids),
                PictureModel.is_validated.is_(True),
            )
            .all()
        )

    def find_by_not_validated(self, limit: int = 10, offset: int = 0):
        return (
            self.db.query(PictureModel)
            .filter(PictureModel.is_validated.is_(False))
            .limit(limit)
            .offset(offset)
            .all()
        )

    def delete(self, picture_id: Union[str, UUID]) -> None:
        lookup_id = picture_id
        if isinstance(picture_id, str):
            try:
                lookup_id = UUID(picture_id)
            except ValueError:
                lookup_id = picture_id

        picture = self.db.query(PictureModel).get(lookup_id)
        if picture is None:
            raise Exception("Picture not found")

        self.db.delete(picture)
        self.db.commit()
