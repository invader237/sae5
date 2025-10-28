from app.role.domain.catalog.role_catalog import RoleCatalog
from app.role.infra.repository.role_repository import RoleRepository


class RoleSQLAlchemyAdapter(RoleCatalog):
    def __init__(self, repository: RoleRepository):
        self.repository = repository

    def find_all(self):
        return self.repository.find_all()

    def save(self, role_in: dict):
        return self.repository.save(role_in)
