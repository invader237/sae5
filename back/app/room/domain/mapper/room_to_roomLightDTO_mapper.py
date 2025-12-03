from app.room.domain.entity.room import Room
from app.room.domain.DTO.roomLightDTO import RoomLightDTO


class RoomToRoomLightDTOMapper:
    @staticmethod
    def apply(room: Room) -> dict:
        return RoomLightDTO(
            id=room.room_id,
            name=room.name,
        )


room_to_roomLightDTO_mapper = RoomToRoomLightDTOMapper()
