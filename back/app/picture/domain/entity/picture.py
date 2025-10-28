import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import declarative_base
from app.database import Base


class Picture(Base):
    __tablename__ = "pictures"

    image_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    path = Column(String(255), nullable=False)
