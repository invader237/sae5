from app.database import SessionLocal
from app.user.infra.repository.user_repository import UserRepository
from app.user.infra.repository.user_sqlalchemy_adapter import UserSQLAlchemyAdapter

def load_fixtures():
    db = SessionLocal()
    try:
        repo = UserRepository(db)
        user_catalog = UserSQLAlchemyAdapter(repo)

        user_catalog.repository.save({"email": "dev@example.com", "name": "Dev User diego"})
        user_catalog.repository.save({"email": "dev@example2.com", "name": "Dev User diego 2"})
    finally:
        db.close()
