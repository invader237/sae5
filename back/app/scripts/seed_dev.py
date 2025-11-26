from app.database import SessionLocal
from app.picture.infra.repository.picture_repository import PictureRepository
from app.room.infra.repository.room_repository import RoomRepository
from app.role.infra.repository.role_repository import RoleRepository
from app.model.infra.repository.model_repository import ModelRepository
from app.model.domain.entity.model import Model
from app.user.domain.entity.user import User
from app.authentification.auth_utils import hash_password


def load_fixtures() -> None:
    db = SessionLocal()

    try:
        picture_repo = PictureRepository(db)
        room_repo = RoomRepository(db)
        role_repo = RoleRepository(db)
        model_repo = ModelRepository(db)

        # ---------- PICTURES ----------
        picture_repo.save({"path": "/images/sample1.png"})
        picture_repo.save({"path": "/images/sample2.png"})

        # ---------- ROOMS ----------
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

        # ---------- ROLES ----------
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

        # ---------- USERS ----------
        user1 = User(
            username="dev1",
            email="dev@example.com",
            password=hash_password("password"),
        )

        user2 = User(
            username="dev2",
            email="dev2@example.com",
            password=hash_password("password2"),
        )

        db.add(user1)
        db.add(user2)

        db.commit()
    finally:
        db.close()
