from app.authentification.schemas import UserCreate
from app.user.domain.entity.user import User
from app.authentification.auth_utils import hash_password


class UserCreateDTOToUserMapper:
    @staticmethod
    def apply(dto: UserCreate) -> User:
        return User(
            username=dto.username,
            email=dto.email,
            password=hash_password(dto.password),
        )


user_createDTO_to_user_mapper = UserCreateDTOToUserMapper()
