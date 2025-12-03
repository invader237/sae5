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

    def update(
        self,
        picture_id: Union[str, UUID],
        updates: dict,
    ) -> PictureModel:
        # Accept either a UUID instance or its string representation.
        lookup_id = picture_id
        if isinstance(picture_id, str):
            try:
                lookup_id = UUID(picture_id)
            except ValueError:
                # keep as string if it isn't a hex UUID
                # the ORM may still accept it
                lookup_id = picture_id

        picture = self.db.query(PictureModel).get(lookup_id)
        if picture is None:
            raise Exception("Picture not found")

        for k, v in updates.items():
            if hasattr(picture, k):
                setattr(picture, k, v)
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

    def find_by_not_validated(self):
        return self.db.query(PictureModel).filter(
            PictureModel.is_validated.is_(False)
        ).all()
