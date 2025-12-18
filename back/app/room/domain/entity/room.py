import uuid
from app.picture.domain.entity.picture import Picture
from sqlalchemy import Column, String, Integer, func, select
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, column_property

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

    pictures = relationship("Picture", back_populates="room")
    histories = relationship("History", back_populates="room")

    validated_picture_count = column_property(
        func.coalesce(
            select(func.count(Picture.image_id))
            .where(Picture.room_id == room_id)
            .where(Picture.is_validated.is_(True))
            .correlate_except(Picture)
            .scalar_subquery(),
            0
        )
    )
