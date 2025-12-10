from app.room.domain.entity.room import Room
from app.room.domain.DTO.roomDTO import RoomDTO


class RoomDTOToRoomMapper:
    @staticmethod
    def apply(room_dto: RoomDTO) -> Room:
        return Room(
            room_id=room_dto.id,
            name=room_dto.name,
            floor=room_dto.floor,
            departement=room_dto.departement,
            type=room_dto.type,
        )

roomDTO_to_room_mapper = RoomDTOToRoomMapper()
