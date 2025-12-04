from typing import Union
from uuid import UUID
from app.picture.domain.catalog.picture_catalog import PictureCatalog
from app.picture.infra.repository.picture_repository import PictureRepository


class PictureSQLAlchemyAdapter(PictureCatalog):
    def __init__(self, repository: PictureRepository):
        self.repository = repository

    def find_all(self):
        return self.repository.find_all()

    def save(self, picture_in: dict):
        return self.repository.save(picture_in)

    def update(self, picture_id: Union[str, UUID], updates: dict):
        return self.repository.update(picture_id, updates)

    def find_by_id(self, picture_id: Union[str, UUID]):
        return self.repository.find_by_id(picture_id)
