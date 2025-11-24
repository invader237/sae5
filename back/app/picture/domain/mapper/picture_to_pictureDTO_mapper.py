from app.picture.domain.DTO.pictureDTO import PictureDTO
from app.picture.domain.entity.picture import Picture


class PictureToPictureDTOMapper:
    @staticmethod
    def apply(picture: Picture) -> PictureDTO:
        return PictureDTO(
            id=picture.image_id,
            path=picture.path,
            analyzed_by=getattr(picture, "analyzed_by", None),
            recognition_percentage=getattr(picture, "recognition_percentage", None),
            analyse_date=getattr(picture, "analyse_date", None),
            validation_date=getattr(picture, "validation_date", None),
        )


picture_to_pictureDTO_mapper = PictureToPictureDTOMapper()
