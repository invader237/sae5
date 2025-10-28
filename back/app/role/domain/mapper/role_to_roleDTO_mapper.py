from app.role.domain.entity.role import Role


class RoleToRoleDTOMapper:
    @staticmethod
    def apply(role: Role) -> dict:
        # Return a plain dict as DTO to avoid modifying generated.py
        return {
            "id": role.role_id,
            "type": role.type,
        }


role_to_roleDTO_mapper = RoleToRoleDTOMapper()
