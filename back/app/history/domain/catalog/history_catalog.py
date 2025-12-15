from typing import Protocol, Collection
from app.history.domain.entity.history import History


class HistoryCatalog(Protocol):
    def find_all(self) -> Collection[History]: ...
    def save(self, history: History) -> History: ...
