import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import declarative_base
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
