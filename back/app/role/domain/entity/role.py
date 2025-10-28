import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import declarative_base
from app.database import Base


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    type = Column(String(50), nullable=False)
