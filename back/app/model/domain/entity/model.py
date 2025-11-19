import uuid
from sqlalchemy import Column, String, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Model(Base):
    __tablename__ = "models"

    model_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    name = Column(
        String(100),
        nullable=False,
    )
    path = Column(
        String(255),
        nullable=False,
    )
    is_active = Column(
        Boolean,
        default=False,
        nullable=False,
    )
    input_size = Column(
        Integer,
        default=384,
        nullable=False,
    )
