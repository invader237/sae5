from app.user.domain.DTO.userDTO import UserDTO
from app.user.domain.entity.user import User


class UserToUserDTOMapper:
    @staticmethod
    def apply(user: User) -> UserDTO:
        return UserDTO(
            id=user.user_id,
            name=user.username,
            email=user.email,
            created_at=user.created_at,
            role=user.role.type if user.role else None
        )


user_to_userDTO_mapper = UserToUserDTOMapper()
