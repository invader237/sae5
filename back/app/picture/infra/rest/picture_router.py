# app/picture/api/picture_controller.py
from fastapi import APIRouter, Depends

from app.picture.domain.mapper.picture_to_pictureDTO_mapper import (
    picture_to_pictureDTO_mapper,
)
from app.picture.domain.DTO.pictureDTO import PictureDTO
from app.picture.domain.catalog.picture_catalog import PictureCatalog
from app.picture.infra.factory.picture_factory import get_picture_catalog


class PictureController:
    def __init__(self):
        self.router = APIRouter(
            prefix="/pictures",
            tags=["pictures"],
        )
        self.router.add_api_route(
            "/",
            self.get_pictures,
            response_model=list[PictureDTO],
            methods=["GET"],
        )

    def get_pictures(
        self,
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
    ):
        pictures = picture_catalog.find_all()
        return [
            picture_to_pictureDTO_mapper.apply(p)
            for p in pictures
        ]


picture_controller = PictureController()
router = picture_controller.router
