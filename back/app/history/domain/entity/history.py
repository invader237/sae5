import uuid
from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class History(Base):
    __tablename__ = "histories"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )

    room_id = Column(
        UUID(as_uuid=True),
        ForeignKey("rooms.room_id"),
        nullable=True,
    )
    image_id = Column(
        UUID(as_uuid=True),
        ForeignKey("pictures.image_id"),
        nullable=True,
    )
    model_id = Column(
        UUID(as_uuid=True),
        ForeignKey("models.model_id"),
        nullable=True,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=True,
    )

    scanned_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    model = relationship("Model", backref="histories", lazy="joined")
    picture = relationship("Picture", backref="histories", lazy="joined")
    room = relationship("Room", back_populates="histories", lazy="joined")
    user = relationship("User", backref="histories", lazy="joined")
