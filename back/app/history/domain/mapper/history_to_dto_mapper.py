from app.history.domain.DTO.historyDTO import HistoryDTO
from app.history.domain.entity.history import History
from app.model.domain.mapper.model_to_modelDTO_mapper import (
    model_to_modelDTO_mapper,
)


class HistoryToDTOMapper:
    @staticmethod
    def apply(history: History) -> HistoryDTO:
        model_dto = (
            model_to_modelDTO_mapper.apply(history.model)
            if history.model is not None
            else None
        )
        return HistoryDTO(
            id=history.id,
            room_id=history.room_id,
            image_id=history.image_id,
            room_name=history.room.name if history.room else None,
            scanned_at=history.scanned_at,
            model=model_dto,
        )


history_to_dto_mapper = HistoryToDTOMapper()
