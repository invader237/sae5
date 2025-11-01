from sqlalchemy.orm import session
from fastapi import Depends

from app.role.infra.repository.role_repository import RoleRepository
from app.role.infra.repository.role_sqlalchemy_adapter import (
    RoleSQLAlchemyAdapter,
)
from app.role.domain.catalog.role_catalog import RoleCatalog
from app.database import get_session


def get_role_catalog(db: session = Depends(get_session)) -> RoleCatalog:
    repo = RoleRepository(db)
    return RoleSQLAlchemyAdapter(repo)
