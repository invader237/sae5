from app.auth.domain.DTO.user_create import UserCreate
from app.user.domain.entity.user import User
from app.auth.infra.password.password_hasher import hash_password


class UserCreateDTOToUserMapper:
    @staticmethod
    def apply(dto: UserCreate) -> User:
        return User(
            username=dto.username,
            email=dto.email,
            password=hash_password(dto.password),
        )


user_createDTO_to_user_mapper = UserCreateDTOToUserMapper()
