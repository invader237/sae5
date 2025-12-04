from fastapi import APIRouter, Depends

from app.history.domain.DTO.historyDTO import HistoryDTO
from app.history.domain.catalog.history_catalog import HistoryCatalog
from app.history.domain.mapper.history_to_dto_mapper import (
    history_to_dto_mapper,
)
from app.history.infra.factory.history_factory import get_history_catalog


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
    ):
        items = history_catalog.find_all()
        return [history_to_dto_mapper.apply(h) for h in items]


history_controller = HistoryController()
router = history_controller.router
