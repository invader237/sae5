from app.history.domain.DTO.historyDTO import HistoryDTO


class HistoryToDTOMapper:
    @staticmethod
    def apply(history, model_name: str | None = None) -> HistoryDTO:
        dto = HistoryDTO.model_validate(history)
        if model_name is None:
            return dto
        return dto.model_copy(update={"model_name": model_name})


history_to_dto_mapper = HistoryToDTOMapper()
