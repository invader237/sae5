"""
Alembic environment configuration file
"""

import sys
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool, MetaData
from alembic import context

from app.config import settings

# --- Import entities ---
from app.user.domain.entity.user import Base as UserBase
from app.model.domain.entity.model import Base as ModelBase
from app.picture.domain.entity.picture import Base as PictureBase
from app.role.domain.entity.role import Base as RoleBase
from app.room.domain.entity.room import Base as RoomBase

# --- Config Alembic ---
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

sys.path.append(str(Path(__file__).resolve().parents[2]))

# --- Merge metadata ---
target_metadata = MetaData()

for meta in [
    UserBase.metadata,
    ModelBase.metadata,
    PictureBase.metadata,
    RoleBase.metadata,
    RoomBase.metadata,
]:
    for table in meta.tables.values():
        target_metadata._add_table(table.name, table.schema, table)

# --- DB URI depending on profile ---
database_url = settings.database_url
config.set_main_option("sqlalchemy.url", database_url)


def run_migrations_offline():
    context.configure(
        url=database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
