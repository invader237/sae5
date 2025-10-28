from sqlalchemy.orm import session
from app.picture.infra.repository.picture_repository import PictureRepository
from app.picture.infra.repository.picture_sqlalchemy_adapter import PictureSQLAlchemyAdapter
from app.picture.domain.catalog.picture_catalog import PictureCatalog
from app.database import get_session
from fastapi import Depends

def get_picture_catalog(db: session = Depends(get_session)) -> PictureCatalog:
    repo = PictureRepository(db)
    return PictureSQLAlchemyAdapter(repo)
