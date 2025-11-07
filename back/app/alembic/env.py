"""
Alembic environment configuration file
Adapted for multi-profile FastAPI project (prod / test / dev / dev-*).
Loads database URL dynamically from app.config.Settings.
"""

import sys
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context
from sqlalchemy import MetaData


# --- 4️⃣ Importer la configuration applicative ---
from app.config import settings

# --- 5️⃣ Importer les modèles SQLAlchemy ---
# ⚠️ Tu dois importer toutes les entités ici pour qu’Alembic les voie.
# Exemple avec une entité User :
# Si tu as plusieurs entités dans d’autres modules, ajoute-les :
# from app.clothing.domain.entity.clothing import Base as ClothingBase
from app.user.domain.entity.user import Base as UserBase

# --- 1️⃣ Charger la config Alembic standard ---
config = context.config

# --- 2️⃣ Configurer le logging Alembic ---
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- 3️⃣ Ajouter ton projet au PYTHONPATH ---
# (pour pouvoir importer les modules app.*)
sys.path.append(str(Path(__file__).resolve().parents[2]))


# Tu peux fusionner les métadonnées si plusieurs Base existent :
target_metadata = MetaData()
target_metadata.reflect(bind=None)
target_metadata = UserBase.metadata  # ← pour l’instant, un seul modèle

# --- 6️⃣ Construire dynamiquement l’URL de connexion ---
# Elle provient directement du profil chargé dans app/config.py
database_url = settings.database_url
config.set_main_option("sqlalchemy.url", database_url)


# --- 7️⃣ Mode OFFLINE ---
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    context.configure(
        url=database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# --- 8️⃣ Mode ONLINE ---
def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,  # détecte les changements de type de colonne
        )

        with context.begin_transaction():
            context.run_migrations()


# --- 9️⃣ Lancer les migrations ---
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
