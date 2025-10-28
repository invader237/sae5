from app.database import SessionLocal
from app.user.infra.repository.user_repository import UserRepository
from app.user.infra.repository.user_sqlalchemy_adapter import (
    UserSQLAlchemyAdapter,
)


def load_fixtures():
    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        picture_repo = PictureRepository(db)
        room_repo = RoomRepository(db)
        role_repo = RoleRepository(db)

        # Users
        user_repo.save({"username": "dev", "email": "dev@example.com"})
        user_repo.save({"username": "dev2", "email": "dev2@example.com"})

        # Pictures
        picture_repo.save({"path": "/images/sample1.png"})
        picture_repo.save({"path": "/images/sample2.png"})

        # Rooms
        room_repo.save({
            "name": "F36",
            "floor": 3,
            "departement": "INFO",
            "type": "IT",
        })
        room_repo.save({
            "name": "E23",
            "floor": 2,
            "departement": "GEA",
            "type": "normal",
        })

        # Roles
        role_repo.save({"type": "admin"})
        role_repo.save({"type": "client"})
    finally:
        db.close()
