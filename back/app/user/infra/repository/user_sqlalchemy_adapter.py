from app.user.domain.catalog.user_catalog import UserCatalog
from app.user.infra.repository.user_repository import UserRepository


class UserSQLAlchemyAdapter(UserCatalog):
    def __init__(self, repository: UserRepository):
        self.repository = repository

    def find_all(self):
        return self.repository.find_all()

    def save(self, user_in: dict):
        return self.repository.save(user_in)
