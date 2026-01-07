"""add user_id to histories

Revision ID: 3c7f2a8b5d91
Revises: eda457bec53d
Create Date: 2026-01-05 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '3c7f2a8b5d91'
down_revision: Union[str, None] = 'eda457bec53d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'histories',
        sa.Column(
            'user_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('users.user_id'),
            nullable=True,
        )
    )


def downgrade() -> None:
    op.drop_column('histories', 'user_id')
