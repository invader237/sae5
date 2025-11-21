from typing import Collection, Optional
from uuid import UUID

from app.user.domain.catalog.user_catalog import UserCatalog
from app.user.domain.entity.user import User
from app.user.infra.repository.user_repository import UserRepository


class UserSQLAlchemyAdapter(UserCatalog):

    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    def find_all(self) -> Collection[User]:
        return self.repository.find_all()

    def save(self, user: User) -> None:
        self.repository.save(user)

    def find_by_email(self, email: str) -> Optional[User]:
        return self.repository.find_by_email(email)

    def find_by_id(self, user_id: UUID) -> Optional[User]:
        return self.repository.find_by_id(user_id)
