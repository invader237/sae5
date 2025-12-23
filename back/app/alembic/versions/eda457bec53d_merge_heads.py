"""merge heads

Revision ID: eda457bec53d
Revises: ec05e8989857, 2b6e9f1c4d2a
Create Date: 2025-12-20 16:22:35.294058

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eda457bec53d'
down_revision: Union[str, Sequence[str], None] = ('ec05e8989857', '2b6e9f1c4d2a')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
