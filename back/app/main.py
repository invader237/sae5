# app/main.py
from fastapi import FastAPI
from app.config import settings
from app.database import engine, Base
from app.scripts.seed_dev import load_fixtures
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

# router import
from app.user.infra.rest.user_router import router as user_router
from app.model.infra.rest.model_router import router as model_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],  # Liste des domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Autoriser tous les headers
)


def refresh_db():
    with engine.begin() as connection:
        connection.execute(text("DROP SCHEMA public CASCADE;"))
        connection.execute(text("CREATE SCHEMA public;"))
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    load_fixtures()


@app.on_event("startup")
def on_startup():
    if settings.APP_PROFILE.startswith("dev"):
        refresh_db()
    else:
        pass


@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}


# router include
app.include_router(user_router)
app.include_router(model_router)
