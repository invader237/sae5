import uuid
from sqlalchemy import Column, String, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Picture(Base):
    __tablename__ = "pictures"

    image_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    path = Column(
        String(255),
        nullable=False,
    )

    analyzed_by = Column(
        String(255),
        nullable=True,
    )
    recognition_percentage = Column(
        Float,
        nullable=True,
    )
    analyse_date = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    validation_date = Column(
        DateTime(timezone=True),
        nullable=True,
    )
    is_validated = Column(
        Boolean,
        nullable=True,
        default=False,
    )
    room_id = Column(
        UUID(as_uuid=True),
        ForeignKey("rooms.room_id"),
        nullable=True
    )

    room = relationship("Room", back_populates="pictures")
