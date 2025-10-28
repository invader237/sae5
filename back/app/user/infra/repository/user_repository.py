from sqlalchemy.orm import Session
from app.user.domain.entity.user import User as UserModel

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self):
        return self.db.query(UserModel).all()

    def save(self, user_in: dict) -> UserModel:
        # Avoid overriding DB server_default for created_at when caller passes None
        data = {k: v for k, v in user_in.items() if not (k == "created_at" and v is None)}
        user = UserModel(**data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
