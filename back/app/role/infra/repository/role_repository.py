from sqlalchemy.orm import Session
from app.role.domain.entity.role import Role as RoleModel


class RoleRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self):
        return self.db.query(RoleModel).all()

    def save(self, role_in: dict) -> RoleModel:
        role = RoleModel(**role_in)
        self.db.add(role)
        self.db.commit()
        self.db.refresh(role)
        return role
