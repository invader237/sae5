from app.dto.generated import UserDTO
from app.user.domain.entity.user import User

class UserToUserDTOMapper:
    @staticmethod
    def apply(user: User) -> UserDTO:
        return UserDTO(
            id=str(user.id),
            name=user.name,
            email=user.email
        )

user_to_userDTO_mapper = UserToUserDTOMapper()
