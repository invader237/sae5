from sqlalchemy.orm import Session
from app.model.domain.entity.model import Model as ModelEntity


class ModelRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self):
        return self.db.query(ModelEntity).all()

    def save(self, model_in: dict) -> ModelEntity:
        model = ModelEntity(**model_in)
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return model
