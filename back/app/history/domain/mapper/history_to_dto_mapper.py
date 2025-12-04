from app.history.domain.DTO.historyDTO import HistoryDTO


class HistoryToDTOMapper:
    @staticmethod
    def apply(history) -> HistoryDTO:
        return HistoryDTO.model_validate(history)


history_to_dto_mapper = HistoryToDTOMapper()
