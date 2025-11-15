from sqlalchemy.orm import Session
from app.model.domain.entity.model import Model as ModelEntity
from app.model.domain.entity.model import Model


class ModelRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(self):
        return self.db.query(ModelEntity).all()

    def find_by_id(self, model_id: str) -> ModelEntity | None:
        return (
            self.db.query(ModelEntity)
            .filter(ModelEntity.model_id == model_id)
            .first()
        )

    def find_active_model(self) -> ModelEntity | None:
        return (
            self.db.query(ModelEntity)
            .filter(ModelEntity.is_active == True)
            .first()
        )

    def save(self, model: Model) -> ModelEntity:
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return model
