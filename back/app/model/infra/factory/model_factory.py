from sqlalchemy.orm import Session
from fastapi import Depends

from app.model.infra.repository.model_repository import ModelRepository
from app.model.infra.repository.model_sqlalchemy_adapter import (
    ModelSQLAlchemyAdapter,
)
from app.model.infra.model_loader.GitModelLoaderImpl import GitModelLoaderImpl
from app.model.domain.catalog.model_catalog import ModelCatalog
from app.model.domain.service.model_loader import ModelLoader
from app.model.domain.service.model_training import ModelTraining
from app.room.infra.factory.room_factory import get_room_catalog
from app.room.domain.catalog.room_catalog import RoomCatalog
from app.picture.domain.catalog.picture_catalog import PictureCatalog
from app.picture.infra.factory.picture_factory import get_picture_catalog
from app.database import get_session
from app.model.domain.service.model_namer import ModelNamer


def get_model_catalog(db: Session = Depends(get_session)) -> ModelCatalog:
    repo = ModelRepository(db)
    return ModelSQLAlchemyAdapter(repo)


def get_model_loader(
        model_catalog: ModelCatalog = Depends(get_model_catalog)
        ) -> ModelLoader:
    # Return the concrete GitModelLoaderImpl (typed as ModelLoader)
    return GitModelLoaderImpl(
        model_catalog=model_catalog, models_dir="/app/models"
        )

def get_model_namer(model_catalog: ModelCatalog = Depends(get_model_catalog)) -> ModelNamer:
    return ModelNamer(model_catalog)


def get_model_training(
    room_catalog: RoomCatalog = Depends(get_room_catalog),
    model_catalog: ModelCatalog = Depends(get_model_catalog),
    picture_catalog: PictureCatalog = Depends(get_picture_catalog),
    model_namer: ModelNamer = Depends(get_model_namer)
) -> ModelTraining:
    return ModelTraining(
        room_catalog=room_catalog,
        model_catalog=model_catalog,
        picture_catalog=picture_catalog,
        model_namer=model_namer
    )

