from dataclasses import dataclass
from typing import Callable
from fastapi import HTTPException, status, Header
from app.authentification.auth_utils import decode_token


@dataclass
class AuthenticatedUser:
    """Représente un utilisateur authentifié via JWT."""
    user_id: str
    role: str


def _extract_token(authorization: str) -> str:
    """Extrait le token du header Authorization Bearer."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    return authorization.split(" ", 1)[1].strip()


def require_role(*allowed_roles: str) -> Callable[..., AuthenticatedUser]:
    """
    Dépendance FastAPI centralisée pour l'authentification par rôle.

    Args:
        *allowed_roles: Rôles autorisés (ex: "admin", "client").
                        Si vide, tous les utilisateurs authentifiés passent.

    Returns:
        Callable: Dépendance FastAPI retournant un AuthenticatedUser.

    Usage:
        @router.get("/admin-only")
        def admin_endpoint(
            user: AuthenticatedUser = Depends(require_role("admin"))
        ):
            return {"user_id": user.user_id, "role": user.role}

        @router.get("/any-authenticated")
        def any_endpoint(
            user: AuthenticatedUser = Depends(require_role())
        ):
            return {"user_id": user.user_id}

        @router.get("/admin-or-moderator")
        def multi_role(
            user: AuthenticatedUser = Depends(
                require_role("admin", "moderator")
            )
        ):
            return {"user_id": user.user_id}
    """

    def dependency(
        authorization: str = Header(..., alias="Authorization"),
    ) -> AuthenticatedUser:
        token = _extract_token(authorization)
        payload = decode_token(token)

        user_id = payload.get("user_id")
        role = payload.get("role")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id",
            )

        if allowed_roles and role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Access denied. Required role(s): "
                    + ", ".join(allowed_roles)
                ),
            )

        return AuthenticatedUser(user_id=user_id, role=role or "")

    return dependency


# Raccourcis pour les cas courants
require_admin = require_role("admin")
require_authenticated = require_role()


def optional_user() -> Callable[..., AuthenticatedUser | None]:
    """
    Dépendance FastAPI qui retourne un utilisateur authentifié ou None.

    Ne lève pas d'exception si l'utilisateur n'est pas authentifié,
    ce qui permet de créer des endpoints accessibles avec ou sans auth.

    Returns:
        Callable: Dépendance FastAPI retournant AuthenticatedUser | None.

    Usage:
        @router.post("/public-endpoint")
        def endpoint(
            user: AuthenticatedUser | None = Depends(optional_user())
        ):
            if user:
                # Fonctionnalité pour utilisateurs connectés
                pass
            else:
                # Fonctionnalité sans authentification
                pass
    """

    def dependency(
        authorization: str | None = Header(None, alias="Authorization"),
    ) -> AuthenticatedUser | None:
        # Si pas d'authorization header, retourne None
        if not authorization or not authorization.startswith("Bearer "):
            return None

        try:
            token = authorization.split(" ", 1)[1].strip()
            payload = decode_token(token)

            user_id = payload.get("user_id")
            role = payload.get("role")

            if not user_id:
                return None

            return AuthenticatedUser(user_id=user_id, role=role or "")
        except Exception:
            # En cas d'erreur de décodage, retourne None au lieu de lever
            return None

    return dependency


# ---- Rétro-compatibilité (deprecated) ----
# Ces fonctions sont conservées pour ne pas casser le code existant
# mais devraient être migrées vers require_role()

def require_admin_legacy(token_payload: dict) -> None:
    """
    DEPRECATED: Utilisez require_role("admin") à la place.
    """
    role = token_payload.get("role")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs.",
        )


def get_current_admin_user_id(
    authorization: str = Header(..., alias="Authorization"),
) -> str:
    """
    DEPRECATED: Utilisez require_role("admin") à la place.

    Conservé pour rétro-compatibilité avec les endpoints existants.
    """
    user = require_admin(authorization=authorization)
    return user.user_id
