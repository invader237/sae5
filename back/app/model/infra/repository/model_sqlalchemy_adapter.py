from app.model.domain.catalog.model_catalog import ModelCatalog
from app.model.infra.repository.model_repository import ModelRepository
from app.model.domain.entity.model import Model


class ModelSQLAlchemyAdapter(ModelCatalog):
    def __init__(self, repository: ModelRepository):
        self.repository = repository

    def find_all(self):
        return self.repository.find_all()

    def find_by_id(self, model_id: str):
        return self.repository.find_by_id(model_id)

    def find_active_model(self):
        return self.repository.find_active_model()

    def save(self, model: Model):
        return self.repository.save(model)
