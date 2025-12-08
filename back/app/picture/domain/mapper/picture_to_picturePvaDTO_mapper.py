from app.picture.domain.DTO.picturePvaDTO import PicturePvaDTO
from app.picture.domain.entity.picture import Picture
from app.room.domain.mapper.room_to_roomLightDTO_mapper import (
    room_to_roomLightDTO_mapper,
)


class PictureToPicturePvaDTOMapper:
    @staticmethod
    def apply(picture: Picture) -> PicturePvaDTO:
        return PicturePvaDTO(
            id=picture.image_id,
            path=picture.path,
            recognition_percentage=getattr(
                picture, "recognition_percentage", None
            ),
            room=room_to_roomLightDTO_mapper.apply(picture.room),
        )


picture_to_picturePvaDTO_mapper = PictureToPicturePvaDTOMapper()
