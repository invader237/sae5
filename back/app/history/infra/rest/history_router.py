from fastapi import APIRouter, Depends

from app.history.domain.DTO.historyDTO import HistoryDTO
from app.history.domain.catalog.history_catalog import HistoryCatalog
from app.history.domain.mapper.history_to_dto_mapper import (
    history_to_dto_mapper,
)
from app.history.infra.factory.history_factory import get_history_catalog
from app.model.domain.catalog.model_catalog import ModelCatalog
from app.model.infra.factory.model_factory import get_model_catalog


class HistoryController:
    def __init__(self):
        self.router = APIRouter(prefix="/histories", tags=["histories"])
        self.router.add_api_route(
            "/",
            self.get_histories,
            response_model=list[HistoryDTO],
            methods=["GET"],
        )

    def get_histories(
        self,
        history_catalog: HistoryCatalog = Depends(get_history_catalog),
        model_catalog: ModelCatalog = Depends(get_model_catalog),
    ):
        items = history_catalog.find_all()
        result = []
        for h in items:
            model_name = None
            model_id = getattr(h, "model_id", None)
            if model_id is not None:
                m = model_catalog.find_by_id(str(model_id))
                model_name = getattr(m, "name", None) if m else None
            result.append(history_to_dto_mapper.apply(h, model_name=model_name))
        return result


history_controller = HistoryController()
router = history_controller.router
