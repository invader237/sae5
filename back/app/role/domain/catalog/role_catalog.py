from typing import Protocol, Collection
from app.role.domain.entity.role import Role


class RoleCatalog(Protocol):
    def find_all(self) -> Collection[Role]: ...
    def save(self, role: Role) -> None: ...
