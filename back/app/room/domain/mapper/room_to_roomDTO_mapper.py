from app.room.domain.entity.room import Room


class RoomToRoomDTOMapper:
    @staticmethod
    def apply(room: Room) -> dict:
        # Return a plain dict representing the DTO to avoid editing
        return {
            "id": room.room_id,
            "name": room.name,
            "floor": room.floor,
            "departement": room.departement,
            "type": room.type,
        }


room_to_roomDTO_mapper = RoomToRoomDTOMapper()
