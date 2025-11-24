from app.dto.generated import PictureDTO
from app.picture.domain.entity.picture import Picture


class PictureToPictureDTOMapper:
    @staticmethod
    def apply(picture: Picture) -> PictureDTO:
        return PictureDTO(
            id=picture.image_id,
            path=picture.path,
            analyse_by=getattr(picture, "analyse_by", None),
            pourcentage=getattr(picture, "pourcentage", None),
            date_detection=getattr(picture, "date_detection", None),
            date_validation=getattr(picture, "date_validation", None),
        )


picture_to_pictureDTO_mapper = PictureToPictureDTOMapper()
