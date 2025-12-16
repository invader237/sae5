from app.history.domain.DTO.historyDTO import HistoryDTO
from app.history.domain.entity.history import History
from app.model.domain.DTO.modelLightDTO import ModelLightDTO


class HistoryToDTOMapper:
    @staticmethod
    def apply(history: History) -> HistoryDTO:
        model_dto = None
        if history.model is not None:
            model_dto = ModelLightDTO(
                id=history.model.model_id,
                name=history.model.name,
            )
        return HistoryDTO(
            id=history.id,
            image_id=history.image_id,
            room_name=history.room_name,
            scanned_at=history.scanned_at,
            model=model_dto,
        )


history_to_dto_mapper = HistoryToDTOMapper()
