from fastapi import APIRouter, Depends

from app.room.domain.mapper.room_to_roomDTO_mapper import (
    room_to_roomDTO_mapper,
)
from app.room.domain.mapper.room_to_roomLightDTO_mapper import (
    room_to_roomLightDTO_mapper,
)
from app.room.domain.mapper.roomDTO_to_room_mapper import (
    roomDTO_to_room_mapper,
)
from app.room.domain.catalog.room_catalog import RoomCatalog
from app.room.infra.factory.room_factory import get_room_catalog
from app.room.domain.DTO.roomLightDTO import RoomLightDTO
from app.room.domain.DTO.roomDTO import RoomDTO


class RoomController:
    def __init__(self):
        self.router = APIRouter(
            prefix="/rooms",
            tags=["rooms"],
        )
        self.router.add_api_route(
            "/",
            self.get_rooms,
            response_model=list[RoomDTO],
            methods=["GET"],
        )
        self.router.add_api_route(
            "/pva",
            self.get_pva_rooms,
            response_model=list[RoomLightDTO],
            methods=["GET"],
        )
        self.router.add_api_route(
            "/",
            self.save_room,
            methods=["POST"],
        )
        self.router.add_api_route(
            "/{room_id}",
            self.delete_room,
            methods=["DELETE"],
        )

    def get_rooms(
        self,
        room_catalog: RoomCatalog = Depends(get_room_catalog),
    ):
        rooms = room_catalog.find_all()
        return [room_to_roomDTO_mapper.apply(room) for room in rooms]

    def get_pva_rooms(
        self,
        room_catalog: RoomCatalog = Depends(get_room_catalog),
    ):
        rooms = room_catalog.find_all()
        return [room_to_roomLightDTO_mapper.apply(r) for r in rooms]

    def save_room(
        self,
        room: RoomDTO,
        room_catalog: RoomCatalog = Depends(get_room_catalog),
    ):
        if room.id:
            existing_room = room_catalog.find_by_id(room.id)
            if not existing_room:
                raise ValueError(f"Room with id {room.id} not found.")

            # Mise à jour des attributs
            existing_room.name = room.name
            existing_room.floor = room.floor
            existing_room.departement = room.departement
            existing_room.type = room.type

            room_catalog.save(existing_room)
            return existing_room

        # Création
        new_room = roomDTO_to_room_mapper.apply(room)
        room_catalog.save(new_room)

    def delete_room(
        self,
        room_id: str,
        room_catalog: RoomCatalog = Depends(get_room_catalog),
    ):
        room_catalog.delete(room_id)


room_controller = RoomController()
router = room_controller.router
