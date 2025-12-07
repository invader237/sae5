from datetime import datetime
from app.database import SessionLocal
from app.picture.infra.repository.picture_repository import PictureRepository
from app.room.infra.repository.room_repository import RoomRepository
from app.role.infra.repository.role_repository import RoleRepository
from app.model.infra.repository.model_repository import ModelRepository
from app.model.domain.entity.model import Model
from app.user.domain.entity.user import User
from app.authentification.auth_utils import hash_password
from app.picture.domain.entity.picture import Picture


def load_fixtures() -> None:
    db = SessionLocal()

    try:
        picture_repo = PictureRepository(db)
        room_repo = RoomRepository(db)
        role_repo = RoleRepository(db)
        model_repo = ModelRepository(db)

        # ---------- ROOMS ----------
        room_repo.save({
            "name": "F36",
            "floor": 3,
            "departement": "INFO",
            "type": "IT",
        })
        room_repo.save({
            "name": "A321",
            "floor": 3,
            "departement": "INFO",
            "type": "normal",
        })
        room_repo.save({
            "name": "A324",
            "floor": 3,
            "departement": "INFO",
            "type": "normal",
        })
        room_repo.save({
            "name": "E35",
            "floor": 3,
            "departement": "INFO",
            "type": "normal",
        })
        room_repo.save({
            "name": "E36",
            "floor": 3,
            "departement": "INFO",
            "type": "normal",
        })
        room_repo.save({
            "name": "E37",
            "floor": 3,
            "departement": "INFO",
            "type": "normal",
        })
        room_repo.save({
            "name": "F33",
            "floor": 3,
            "departement": "INFO",
            "type": "normal",
        })

        # ---------- PICTURES ----------
        picture_repo.save(
            Picture(
                path="/images/room_f36_view1.png",
                analyzed_by="model_v1",
                recognition_percentage=95.0,
                analyse_date=datetime(2024, 1, 15, 10, 0, 0),
                validation_date=datetime(2024, 1, 15, 12, 0, 0),
                is_validated=True,
                room=room_repo.find_by_name("F36"),
            )
        )

        picture_repo.save(
            Picture(
                path="/images/room_e23_view2.png",
                analyzed_by="model_v1",
                recognition_percentage=88.5,
                analyse_date=datetime(2024, 1, 16, 11, 30, 0),
                validation_date=None,
                is_validated=False,
                room=room_repo.find_by_name("F33"),
            )
        )

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
