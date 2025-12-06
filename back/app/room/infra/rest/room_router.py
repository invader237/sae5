from fastapi import APIRouter, Depends

from app.room.domain.mapper.room_to_roomDTO_mapper import (
    room_to_roomDTO_mapper,
)
from app.room.domain.mapper.room_to_roomLightDTO_mapper import (
    room_to_roomLightDTO_mapper,
)
from app.room.domain.catalog.room_catalog import RoomCatalog
from app.room.infra.factory.room_factory import get_room_catalog
from app.room.domain.DTO.roomLightDTO import RoomLightDTO


class RoomController:
    def __init__(self):
        self.router = APIRouter(
            prefix="/rooms",
            tags=["rooms"],
        )
        self.router.add_api_route(
            "/",
            self.get_rooms,
            response_model=list[dict],
            methods=["GET"],
        )
        self.router.add_api_route(
            "/pva",
            self.get_pva_rooms,
            response_model=list[RoomLightDTO],
            methods=["GET"],
        )

    def get_rooms(
        self,
        room_catalog: RoomCatalog = Depends(get_room_catalog),
    ):
        rooms = room_catalog.find_all()
        return [
            room_to_roomDTO_mapper.apply(r)
            for r in rooms
        ]

    def get_pva_rooms(
        self,
        room_catalog: RoomCatalog = Depends(get_room_catalog),
    ):
        rooms = room_catalog.find_all()
        return [
            room_to_roomLightDTO_mapper.apply(r)
            for r in rooms
        ]


room_controller = RoomController()
router = room_controller.router
