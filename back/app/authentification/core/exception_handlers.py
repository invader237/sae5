from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


# ============
# Exceptions métier
# ============

class EmailAlreadyUsedError(Exception):
    """Levée quand on tente d'enregistrer un email déjà utilisé."""


class InvalidCredentialsError(Exception):
    """Levée quand l'email ou le mot de passe sont invalides."""


class AuthenticationError(Exception):
    """
    Levée quand l'utilisateur n'est pas authentifié
    ou que le jeton est invalide / expiré.
    """


# ============
# Handlers
# ============

async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """
    Handler générique pour les erreurs de validation FastAPI (422).
    """
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
        },
    )


async def email_already_used_handler(
    request: Request,
    exc: EmailAlreadyUsedError,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Cet email est déjà associé à un compte."},
    )


async def invalid_credentials_handler(
    request: Request,
    exc: InvalidCredentialsError,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": "Email ou mot de passe incorrect."},
    )


async def authentication_error_handler(
    request: Request,
    exc: AuthenticationError,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": "Authentification requise ou jeton invalide."},
    )


# ============
# Enregistrement global
# ============

def register_exception_handlers(app: FastAPI) -> None:
    """
    Fonction utilitaire appelée dans main.py
    pour enregistrer tous les handlers custom.
    """
    app.add_exception_handler(
        RequestValidationError,
        validation_exception_handler,
    )
    app.add_exception_handler(
        EmailAlreadyUsedError,
        email_already_used_handler,
    )
    app.add_exception_handler(
        InvalidCredentialsError,
        invalid_credentials_handler,
    )
    app.add_exception_handler(
        AuthenticationError,
        authentication_error_handler,
    )
