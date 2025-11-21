from app.picture.domain.DTO.pictureDTO import PictureDTO
from app.picture.domain.entity.picture import Picture


class PictureToPictureDTOMapper:
    @staticmethod
    def apply(picture: Picture) -> PictureDTO:
        return PictureDTO(
            id=picture.image_id,
            path=picture.path,
        )


picture_to_pictureDTO_mapper = PictureToPictureDTOMapper()
