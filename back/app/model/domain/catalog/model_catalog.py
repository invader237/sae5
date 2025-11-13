from typing import Protocol, Collection
from app.model.domain.entity.model import Model


class ModelCatalog(Protocol):
    def find_all(self) -> Collection[Model]: ...
    def save(self, model_in: dict) -> Model: ...
