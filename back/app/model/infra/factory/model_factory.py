from sqlalchemy.orm import Session
from fastapi import Depends

from app.model.infra.repository.model_repository import ModelRepository
from app.model.infra.repository.model_sqlalchemy_adapter import (
    ModelSQLAlchemyAdapter,
)
from app.model.domain.catalog.model_catalog import ModelCatalog
from app.model.domain.service.model_loader import ModelLoader
from app.database import get_session


def get_model_catalog(db: Session = Depends(get_session)) -> ModelCatalog:
    repo = ModelRepository(db)
    return ModelSQLAlchemyAdapter(repo)

def get_model_loader(model_catalog: ModelCatalog = Depends(get_model_catalog)) -> ModelLoader:
    return ModelLoader(model_catalog=model_catalog)
