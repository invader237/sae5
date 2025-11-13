from app.model.domain.catalog.model_catalog import ModelCatalog
from app.model.infra.repository.model_repository import ModelRepository


class ModelSQLAlchemyAdapter(ModelCatalog):
    def __init__(self, repository: ModelRepository):
        self.repository = repository

    def find_all(self):
        return self.repository.find_all()

    def save(self, model_in: dict):
        return self.repository.save(model_in)
