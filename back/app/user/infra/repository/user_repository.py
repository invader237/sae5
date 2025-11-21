from sqlalchemy.orm import Session
from app.user.domain.entity.user import User as UserModel
from app.user.domain.entity.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self):
        return self.db.query(UserModel).all()

    def save(self, user_in: dict) -> UserModel:
        # Avoid overriding DB server_default for created_at when
        # caller passes None
        if isinstance(user_in, dict):
            user = User(**user_in)
        else:
            user = user_in

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def find_by_email(self, email: str) -> UserModel | None:
        return (
            self.db.query(UserModel)
            .filter(UserModel.email == email)
            .first()
        )

    def find_by_id(self, user_id: str) -> UserModel | None:
        return (
            self.db.query(UserModel)
            .filter(UserModel.user_id == user_id)
            .first()
        )
