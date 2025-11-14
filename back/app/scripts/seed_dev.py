from app.database import SessionLocal
from app.user.infra.repository.user_repository import UserRepository
from app.picture.infra.repository.picture_repository import PictureRepository
from app.room.infra.repository.room_repository import RoomRepository
from app.role.infra.repository.role_repository import RoleRepository
from app.model.infra.repository.model_repository import ModelRepository

from app.model.domain.entity.model import Model


def load_fixtures():
    db = SessionLocal()
    try:
        # user_repo = UserRepository(db)
        picture_repo = PictureRepository(db)
        room_repo = RoomRepository(db)
        role_repo = RoleRepository(db)
        model_repo = ModelRepository(db)

        # Users
        # user_repo.save({"username": "dev", "email": "dev@example.com"})
        # user_repo.save({"username": "dev2", "email": "dev2@example.com"})

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

        # Models
        model_repo.save(
            Model(
                name="Mon modèle",
                path="/models/test",
                is_active=False,
                input_size=384,
            )
        )

    finally:
        db.close()
