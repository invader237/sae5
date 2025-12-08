from app.room.domain.entity.room import Room
from app.room.domain.DTO.roomDTO import RoomDTO


class RoomToRoomDTOMapper:
    @staticmethod
    def apply(room: Room) -> dict:
        return RoomDTO(
            id=room.room_id,
            name=room.name,
            floor=room.floor,
            departement=room.departement,
            type=room.type,
        )


room_to_roomDTO_mapper = RoomToRoomDTOMapper()
