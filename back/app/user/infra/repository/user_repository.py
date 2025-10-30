from sqlalchemy.orm import Session
from app.user.domain.entity.user import User as UserModel

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self):
        return self.db.query(UserModel).all()

    def save(self, user_in: dict) -> UserModel:
        user = UserModel(**user_in)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
