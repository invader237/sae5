import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, event
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Session

from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    username = Column(
        String(50),
        nullable=False,
    )
    email = Column(
        String(100),
        unique=True,
        nullable=False,
    )
    password = Column(
        String(255),
        nullable=False,
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    role_id = Column(
        UUID(as_uuid=True),
        ForeignKey("roles.role_id"),
        nullable=True,
    )

    role = relationship("Role", backref="users")


@event.listens_for(User, 'before_insert')
def assign_default_role(mapper, connection, target):
    """Assigne automatiquement le rôle 'client' si aucun rôle n'est défini"""
    if target.role_id is None:
        from app.role.domain.entity.role import Role
        session = Session.object_session(target)
        if session:
            client_role = session.query(Role).filter(Role.type == "client").first()
            if client_role:
                target.role_id = client_role.role_id
