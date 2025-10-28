from sqlalchemy.orm import session
from fastapi import Depends

from app.database import get_session
from app.user.domain.catalog.user_catalog import UserCatalog
from app.user.infra.repository.user_repository import UserRepository
from app.user.infra.repository.user_sqlalchemy_adapter import (
    UserSQLAlchemyAdapter,
)


def get_user_catalog(db: session = Depends(get_session)) -> UserCatalog:
    repo = UserRepository(db)
    return UserSQLAlchemyAdapter(repo)
