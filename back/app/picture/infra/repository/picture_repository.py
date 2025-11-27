from sqlalchemy.orm import Session
from app.picture.domain.entity.picture import Picture as PictureModel


class PictureRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self):
        return self.db.query(PictureModel).all()

    def save(self, picture_in: dict) -> PictureModel:
        picture = PictureModel(**picture_in)
        self.db.add(picture)
        self.db.commit()
        self.db.refresh(picture)
        return picture

    def update(self, picture_id: int, updates: dict) -> PictureModel:
        picture = self.db.query(PictureModel).get(picture_id)
        if picture is None:
            raise Exception("Picture not found")

        for k, v in updates.items():
            if hasattr(picture, k):
                setattr(picture, k, v)
        self.db.commit()
        self.db.refresh(picture)
        return picture
