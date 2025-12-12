from fastapi import HTTPException, status
from app.authentification.auth_utils import decode_token


def require_admin(token_payload: dict) -> None:
    """
    Vérifie que l'utilisateur a le rôle admin.

    Args:
        token_payload: Payload du token JWT décodé

    Raises:
        HTTPException: Si l'utilisateur n'a pas le rôle admin
    """
    role = token_payload.get("role")

    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs.",
        )


def get_current_admin_user_id(authorization: str) -> str:
    """
    Extrait l'user_id du token et vérifie l'admin status.

    Args:
        authorization: Header Authorization (Bearer token)

    Returns:
        str: L'ID de l'utilisateur admin

    Raises:
        HTTPException: Si token invalide ou user pas admin
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Format d'autorisation invalide.",
        )

    token = authorization.split(" ", 1)[1].strip()
    token_payload = decode_token(token)

    require_admin(token_payload)

    user_id = token_payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide.",
        )

    return user_id
