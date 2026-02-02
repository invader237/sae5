from dataclasses import dataclass
from typing import Callable
from fastapi import HTTPException, status, Header
from app.auth.infra.jwt.jwt_service import decode_token


@dataclass
class AuthenticatedUser:
    user_id: str
    role: str


def _extract_token(authorization: str) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    return authorization.split(" ", 1)[1].strip()


def require_role(*allowed_roles: str) -> Callable[..., AuthenticatedUser]:
    def dependency(
            authorization: str = Header(..., alias="Authorization")
    ) -> AuthenticatedUser:
        token = _extract_token(authorization)
        payload = decode_token(token)

        user_id = payload.get("sub")
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
                    "Access denied. Required role(s): " +
                    ", ".join(allowed_roles)
                ),
            )

        return AuthenticatedUser(user_id=user_id, role=role or "")

    return dependency


require_admin = require_role("admin")
require_authenticated = require_role()


def optional_user() -> Callable[..., AuthenticatedUser | None]:
    def dependency(
            authorization: str | None = Header(None, alias="Authorization")
    ) -> AuthenticatedUser | None:
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
            return None

    return dependency
