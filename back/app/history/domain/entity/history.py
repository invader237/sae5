import uuid
from sqlalchemy import Column, String, DateTime
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

    image_path = Column(String(255), nullable=False)
    room_name = Column(String(255), nullable=True)

    scanned_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
