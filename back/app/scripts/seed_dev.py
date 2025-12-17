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
from app.room.domain.entity.room import Room


def load_fixtures() -> None:
    db = SessionLocal()

    try:
        picture_repo = PictureRepository(db)
        room_repo = RoomRepository(db)
        role_repo = RoleRepository(db)
        model_repo = ModelRepository(db)

        # ---------- ROOMS ----------
        room_repo.save(Room(
            name="F36",
            floor=3,
            departement="INFO",
            type="IT",
        ))

        room_repo.save(Room(
            name="E24",
            floor=3,
            departement="INFO",
            type="normal",
        ))

        room_repo.save(Room(
            name="A321",
            floor=3,
            departement="INFO",
            type="normal",
        ))

        room_repo.save(Room(
            name="A324",
            floor=3,
            departement="INFO",
            type="normal",
        ))

        room_repo.save(Room(
            name="E35",
            floor=3,
            departement="INFO",
            type="normal",
        ))

        room_repo.save(Room(
            name="E36",
            floor=3,
            departement="INFO",
            type="normal",
        ))

        room_repo.save(Room(
            name="E37",
            floor=3,
            departement="INFO",
            type="normal",
        ))

        room_repo.save(Room(
            name="F33",
            floor=3,
            departement="INFO",
            type="normal",
        ))

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
        # Récupérer les rôles
        admin_role = role_repo.find_by_type("admin")
        client_role = role_repo.find_by_type("client")

        user1 = User(
            username="admin",
            email="admin@example.com",
            password=hash_password("admin123"),
            role_id=admin_role.role_id if admin_role else None,
        )

        user2 = User(
            username="client",
            email="client@example.com",
            password=hash_password("client123"),
            role_id=client_role.role_id if client_role else None,
        )

        db.add(user1)
        db.add(user2)

        db.commit()
    finally:
        db.close()
