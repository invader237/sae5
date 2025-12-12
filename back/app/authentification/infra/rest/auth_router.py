from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.authentification.auth_utils import (
    create_access_token,
    decode_token,
    verify_password,
    hash_password,
)
from app.authentification.schemas import (
    TokenOut, UserCreate, UserLogin, PasswordUpdate
)
from app.user.domain.DTO.userDTO import UserDTO
from app.user.domain.catalog.user_catalog import UserCatalog
from app.user.domain.mapper.userCreateDTO_to_user_mapper import (
    user_createDTO_to_user_mapper,
)
from app.user.domain.mapper.user_to_userDTO_mapper import (
    user_to_userDTO_mapper,
)
from app.user.infra.factory.user_factory import get_user_catalog


router = APIRouter(prefix="/auth", tags=["auth"])


def get_current_user_id(
    authorization: str = Header(
        ...,
        description="Header Authorization: Bearer <token>",
    ),
) -> UUID:

    token = authorization.split(" ", 1)[1].strip()

    token_payload = decode_token(token)

    user_id_from_token = token_payload.get("user_id")
    if not user_id_from_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Le jeton fourni est invalide "
                "(aucun utilisateur associé)."
            ),
        )

    try:
        return UUID(user_id_from_token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Le jeton fourni est invalide "
                "(identifiant utilisateur incorrect)."
            ),
        ) from exc


@router.post(
        "/register", response_model=UserDTO,
        status_code=status.HTTP_201_CREATED)
def register(
    user_create: UserCreate,
    user_catalog: UserCatalog = Depends(
        get_user_catalog),
) -> UserDTO:
    existing = user_catalog.find_by_email(user_create.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà associé à un compte.",
        )

    user_entity = user_createDTO_to_user_mapper.apply(user_create)
    user_catalog.save(user_entity)

    return user_to_userDTO_mapper.apply(user_entity)


@router.post("/login", response_model=TokenOut)
def login(
    user_login: UserLogin,
    user_catalog: UserCatalog = Depends(get_user_catalog),
) -> TokenOut:
    user = user_catalog.find_by_email(user_login.email)

    # user peut être None si l'email n'existe pas en base
    if not user or not verify_password(user_login.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect.",
        )

    role_type = user.role.type if user.role else None
    token = create_access_token(str(user.user_id), role_type)

    return TokenOut(access_token=token)


@router.get("/me", response_model=UserDTO)
def me(
    user_id: UUID = Depends(get_current_user_id),
    user_catalog: UserCatalog = Depends(get_user_catalog),
) -> UserDTO:
    user = user_catalog.find_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable.",
        )

    return user_to_userDTO_mapper.apply(user)


@router.put(
    "/password",
    status_code=status.HTTP_204_NO_CONTENT,
)
def change_password(
    payload: PasswordUpdate,
    user_id: UUID = Depends(get_current_user_id),
    user_catalog: UserCatalog = Depends(get_user_catalog),
) -> None:
    """
    Permet à un utilisateur authentifié de modifier son mot de passe.

    Erreurs possibles :
    - 401 : ancien mot de passe incorrect
    - 404 : utilisateur introuvable
    """
    user = user_catalog.find_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable.",
        )

    if not verify_password(payload.old_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ancien mot de passe incorrect.",
        )

    user.password = hash_password(payload.new_password)
    user_catalog.save(user)


@router.get("/debug/users")
def debug_users(
    user_catalog: UserCatalog = Depends(get_user_catalog),
) -> list[dict]:
    users = user_catalog.find_all()
    return [
        {
            "user_id": str(u.user_id),
            "username": u.username,
            "email": u.email,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]
