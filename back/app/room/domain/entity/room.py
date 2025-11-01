import uuid
from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Room(Base):
    __tablename__ = "rooms"

    room_id = Column(
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
    floor = Column(
        Integer,
        nullable=True,
    )
    departement = Column(
        String(100),
        nullable=True,
    )
    type = Column(
        String(50),
        nullable=True,
    )
