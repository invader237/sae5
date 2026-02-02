from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.domain.service.auth_service import AuthService
from app.auth.infra.password.password_hasher import (
    hash_password,
    verify_password,
)
from app.auth.infra.rest.dependencies import get_current_user
from app.auth.domain.DTO.user_login import UserLogin
from app.auth.domain.DTO.token import TokenOut
from app.auth.domain.DTO.password_update import PasswordUpdate
from app.auth.domain.DTO.user_create import UserCreate
from app.user.domain.DTO.userDTO import UserDTO
from app.user.domain.catalog.user_catalog import UserCatalog
from app.role.domain.catalog.role_catalog import RoleCatalog
from app.user.domain.mapper.userCreateDTO_to_user_mapper import (
    user_createDTO_to_user_mapper,
)
from app.user.domain.mapper.user_to_userDTO_mapper import (
    user_to_userDTO_mapper,
)
from app.user.infra.factory.user_factory import get_user_catalog
from app.role.infra.factory.role_factory import get_role_catalog


class AuthController:
    def __init__(self):
        self.router = APIRouter(
            prefix="/auth",
            tags=["auth"],
        )

        self.router.add_api_route(
            "/login",
            self.login,
            methods=["POST"],
            response_model=TokenOut,
        )

        self.router.add_api_route(
            "/register",
            self.register,
            response_model=UserDTO,
            methods=["POST"],
        )

        self.router.add_api_route(
            "/me",
            self.me,
            methods=["GET"],
            response_model=UserDTO,
        )

        self.router.add_api_route(
            "/password",
            self.change_password,
            methods=["PUT"],
            status_code=status.HTTP_204_NO_CONTENT,
        )

    def login(
        self,
        user_login: UserLogin,
        user_catalog: UserCatalog = Depends(get_user_catalog),
    ) -> TokenOut:
        try:
            auth_service = AuthService(user_catalog)
            token = auth_service.authenticate(
                user_login.email,
                user_login.password
            )

            return TokenOut(access_token=token)

        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

    def register(
        self,
        user_create: UserCreate,
        user_catalog: UserCatalog = Depends(get_user_catalog),
        role_catalog: RoleCatalog = Depends(get_role_catalog),
    ) -> UserDTO:

        existing = user_catalog.find_by_email(user_create.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà associé à un compte.",
            )

        user_entity = user_createDTO_to_user_mapper.apply(user_create)

        default_role = (
            role_catalog.find_by_type("client")
            or role_catalog.find_by_type("user")
            or role_catalog.find_by_type("USER")
        )
        if not default_role:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Rôle par défaut introuvable.",
            )

        user_entity.role_id = default_role.role_id

        user_catalog.save(user_entity)

        return user_to_userDTO_mapper.apply(user_entity)

    def me(
        self,
        user: dict = Depends(get_current_user),
        user_catalog: UserCatalog = Depends(get_user_catalog),
    ) -> UserDTO:
        try:
            user_id = UUID(user.get("user_id"))
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token user id",
            )

        user_entity = user_catalog.find_by_id(user_id)
        if not user_entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur introuvable.",
            )

        return user_to_userDTO_mapper.apply(user_entity)

    def change_password(
        self,
        payload: PasswordUpdate,
        user: dict = Depends(get_current_user),
        user_catalog: UserCatalog = Depends(get_user_catalog),
    ) -> None:
        try:
            user_id = UUID(user.get("user_id"))
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token user id",
            )

        user_entity = user_catalog.find_by_id(user_id)
        if not user_entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur introuvable.",
            )

        if not verify_password(payload.old_password, user_entity.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Ancien mot de passe incorrect.",
            )

        user_entity.password = hash_password(payload.new_password)
        user_catalog.save(user_entity)


auth_controller = AuthController()
router = auth_controller.router
