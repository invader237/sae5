# app/picture/api/picture_controller.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from pathlib import Path
from typing import Literal
import uuid

from app.picture.domain.mapper.picture_to_pictureDTO_mapper import (
    picture_to_pictureDTO_mapper,
)
from app.dto.generated import PictureDTO
from app.picture.domain.catalog.picture_catalog import PictureCatalog
from app.picture.infra.factory.picture_factory import get_picture_catalog

UPLOAD_DIR = Path("uploads")

class PictureController:
    def __init__(self):
        self.router = APIRouter(prefix="/pictures", tags=["pictures"])
        self.router.add_api_route(
            "/",
            self.get_pictures,
            response_model=list[PictureDTO],
            methods=["GET"],
        )
        self.router.add_api_route(
            "/import",
            self.import_picture,
            response_model=PictureDTO,
            methods=["POST"],
        )

    def get_pictures(
        self,
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
    ):
        pictures = picture_catalog.find_all()
        return [picture_to_pictureDTO_mapper.apply(p) for p in pictures]

    async def import_picture(
        self,
        type: Literal["analyse", "database"] = Query(..., description="Type d'import"),
        file: UploadFile = File(...),
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
    ):
        if file.content_type not in {"image/jpeg", "image/png", "image/jpg"}:
            raise HTTPException(status_code=400, detail="Type de fichier non supporté")

        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        extension = Path(file.filename).suffix or ".jpg"
        filename = f"{uuid.uuid4()}{extension}"
        dest_path = UPLOAD_DIR / filename

        contents = await file.read()
        dest_path.write_bytes(contents)

        picture = picture_catalog.save({"path": str(dest_path)})
        return picture_to_pictureDTO_mapper.apply(picture)


picture_controller = PictureController()
router = picture_controller.router
