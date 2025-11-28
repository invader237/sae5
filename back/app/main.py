from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.scripts.seed_dev import load_fixtures
from sqlalchemy import text
from fastapi.exceptions import RequestValidationError
from app.authentification.core.exception_handlers import (
    validation_exception_handler,
)


# router import
from app.user.infra.rest.user_router import router as user_router
from app.model.infra.rest.model_router import router as model_router
from app.picture.infra.rest.picture_router import router as picture_router
from app.authentification.infra.rest.auth_router import (
    router as auth_router,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler,
)

Base.metadata.create_all(bind=engine)


def refresh_db() -> None:
    """Réinitialise le schéma public et recharge les fixtures en mode dev."""
    with engine.begin() as connection:
        connection.execute(text("DROP SCHEMA public CASCADE;"))
        connection.execute(text("CREATE SCHEMA public;"))
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    load_fixtures()


@app.on_event("startup")
def on_startup() -> None:
    if settings.APP_PROFILE.startswith("dev"):
        refresh_db()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root() -> dict:
    return {"message": "Welcome to the FastAPI application!"}


# routers include
app.include_router(user_router)
app.include_router(model_router)
app.include_router(picture_router)
app.include_router(auth_router)
