"""Update histories fields

Revision ID: 2b6e9f1c4d2a
Revises: 198468c4ad55
Create Date: 2025-12-15 00:00:00

"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "2b6e9f1c4d2a"
down_revision: Union[str, Sequence[str], None] = "198468c4ad55"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    bind = op.get_bind()
    inspector = inspect(bind)

    if "histories" not in inspector.get_table_names():
        op.create_table(
            "histories",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("image_id", sa.UUID(), nullable=True),
            sa.Column("room_name", sa.String(length=255), nullable=True),
            sa.Column("model_id", sa.UUID(), nullable=True),
            sa.Column(
                "scanned_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("id"),
        )
        return

    columns = {c["name"] for c in inspector.get_columns("histories")}

    # Drop duplicated data (path lives on pictures)
    if "image_path" in columns:
        op.drop_column("histories", "image_path")

    # Rename picture_id -> image_id (align with Picture.image_id)
    if "picture_id" in columns and "image_id" not in columns:
        op.alter_column(
            "histories",
            "picture_id",
            new_column_name="image_id",
            existing_type=sa.UUID(),
            existing_nullable=True,
        )
    elif "image_id" not in columns:
        op.add_column(
            "histories",
            sa.Column("image_id", sa.UUID(), nullable=True),
        )

    # New model_id column (nullable for backward compatibility)
    if "model_id" not in columns:
        op.add_column(
            "histories",
            sa.Column("model_id", sa.UUID(), nullable=True),
        )

    # Ensure expected columns exist
    if "room_name" not in columns:
        op.add_column(
            "histories",
            sa.Column("room_name", sa.String(length=255), nullable=True),
        )

    if "scanned_at" not in columns:
        op.add_column(
            "histories",
            sa.Column(
                "scanned_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
        )


def downgrade() -> None:
    """Downgrade schema."""

    bind = op.get_bind()
    inspector = inspect(bind)

    if "histories" not in inspector.get_table_names():
        return

    columns = {c["name"] for c in inspector.get_columns("histories")}

    if "model_id" in columns:
        op.drop_column("histories", "model_id")

    if "image_id" in columns and "picture_id" not in columns:
        op.alter_column(
            "histories",
            "image_id",
            new_column_name="picture_id",
            existing_type=sa.UUID(),
            existing_nullable=True,
        )

    # Re-add image_path as nullable (cannot restore values)
    if "image_path" not in columns:
        op.add_column(
            "histories",
            sa.Column("image_path", sa.String(length=255), nullable=True),
        )
