from fastapi import APIRouter, Depends
from app.room.domain.mapper.room_to_roomDTO_mapper import room_to_roomDTO_mapper
from app.dto.generated import UserDTO  # placeholder to keep import shape; responses will be plain dicts
from app.room.domain.catalog.room_catalog import RoomCatalog
from app.room.infra.factory.room_factory import get_room_catalog


class RoomController:
    def __init__(self):
        self.router = APIRouter(prefix="/rooms", tags=["rooms"])
        self.router.add_api_route(
            "/", self.get_rooms, response_model=list[dict], methods=["GET"]
        )

    def get_rooms(self, room_catalog: RoomCatalog = Depends(get_room_catalog)):
        rooms = room_catalog.find_all()
        return [room_to_roomDTO_mapper.apply(r) for r in rooms]


room_controller = RoomController()
router = room_controller.router
