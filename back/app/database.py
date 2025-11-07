# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

Base = declarative_base()

engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autoflush=True, bind=engine)


def get_session():
    return SessionLocal()
