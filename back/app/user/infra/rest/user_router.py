# app/user/api/user_controller.py
from fastapi import APIRouter, Depends

from app.user.domain.DTO.userDTO import UserDTO
from app.user.domain.catalog.user_catalog import UserCatalog
from app.user.domain.mapper.user_to_userDTO_mapper import (
    user_to_userDTO_mapper,
)
from app.user.infra.factory.user_factory import get_user_catalog


class UserController:
    def __init__(self):
        self.router = APIRouter(
            prefix="/users",
            tags=["users"],
        )
        self.router.add_api_route(
            "/",
            self.get_users,
            response_model=list[UserDTO],
            methods=["GET"],
        )

    def get_users(
        self, user_catalog: UserCatalog = Depends(get_user_catalog)
    ):
        users = user_catalog.find_all()
        return [user_to_userDTO_mapper.apply(u) for u in users]


user_controller = UserController()
router = user_controller.router
