# app/picture/api/picture_controller.py
from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    HTTPException,
    Query,
    Form,
    Path as FastAPIPath,
    Body,
)
from PIL import Image
import io
from typing import List
from fastapi.responses import StreamingResponse
from pathlib import Path
from typing import Literal
import uuid
from datetime import datetime, timezone
import json

from app.picture.domain.mapper.picture_to_pictureDTO_mapper import (
    picture_to_pictureDTO_mapper,
)
from app.picture.domain.mapper.picture_to_picturePvaDTO_mapper import (
    picture_to_picturePvaDTO_mapper,
)
from app.picture.domain.entity.picture import Picture
from app.picture.domain.DTO.pictureDTO import PictureDTO
from app.picture.domain.DTO.picturePvaDTO import PicturePvaDTO
from app.picture.domain.catalog.picture_catalog import PictureCatalog
from app.picture.infra.factory.picture_factory import get_picture_catalog
from app.room.infra.factory.room_factory import get_room_catalog
from app.room.domain.catalog.room_catalog import RoomCatalog
from app.model.domain.service.predict import predict_image
from app.model.infra.factory.model_factory import get_model_loader

UPLOAD_DIR = Path("uploads")


class PictureController:
    def __init__(self):
        self.router = APIRouter(prefix="/pictures", tags=["pictures"])
        self.router.add_api_route(
            "/",
            self.get_pictures,
            response_model=list[PictureDTO],
            methods=["GET"],
        )
        self.router.add_api_route(
            "/import",
            self.import_picture,
            response_model=PictureDTO,
            methods=["POST"],
        )
        self.router.add_api_route(
            "/to-validate",
            self.find_picture_to_validate,
            response_model=list[PicturePvaDTO],
            methods=["GET"],
        )
        self.router.add_api_route(
            "/validate",
            self.validate_pictures,
            response_model=list[PictureDTO],
            methods=["PATCH"],
        )
        self.router.add_api_route(
            "/{picture_id}/recover",
            self.recover_picture,
            response_model=bytes,
            methods=["GET"],
        )
        self.router.add_api_route(
            "/pva",
            self.delete_pictures_pva,
            response_model=dict,
            methods=["DELETE"],
        )
        self.router.add_api_route(
            "/pva/update-room",
            self.update_room_pva,
            response_model=list[PicturePvaDTO],
            methods=["PATCH"],
        )

    def get_pictures(
        self,
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
    ):
        pictures = picture_catalog.find_all()
        return [picture_to_pictureDTO_mapper.apply(p) for p in pictures]

    async def import_picture(
        self,
        type: Literal["analyse", "database"] | None = Query(
            None,
            alias="type",
            description="Type d'import",
        ),
        type_form: Literal["analyse", "database"] | None = Form(
            None,
            alias="type",
            description="Type d'import (form)",
        ),
        file: UploadFile | None = File(None),
        image: UploadFile | None = File(None),
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
        room_catalog: RoomCatalog = Depends(get_room_catalog),
        model_loader=Depends(get_model_loader),
    ):
        # Supporte file ou image comme clé multipart
        upload_file = file or image
        if upload_file is None:
            raise HTTPException(
                status_code=422,
                detail="Champ 'file' manquant (ou 'image')",
            )

        # Accepte le type via query ou form
        import_type_value = type or type_form
        if import_type_value is None:
            raise HTTPException(
                status_code=422,
                detail="Paramètre 'type' requis (analyse|database)",
            )

        if upload_file.content_type not in {
            "image/jpeg",
            "image/png",
            "image/jpg",
        }:
            raise HTTPException(
                status_code=400,
                detail="Type de fichier non supporté",
            )

        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        extension = Path(upload_file.filename).suffix or ".jpg"
        filename = f"{uuid.uuid4()}{extension}"
        dest_path = UPLOAD_DIR / filename

        contents = await upload_file.read()
        dest_path.write_bytes(contents)

        # Inference synchrone avant sauvegarde
        try:
            inference_result = predict_image(
                contents,
                model_version=None,
                top_k=5,
                confidence_threshold=0.0,
                model_loader=model_loader,
                labels=None,
                preprocess_config=None,
                save_callback=None,
                device=None,
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Inference failed: {e}"
                )

        # Affichage console du résultat d'inférence (formaté)
        try:
            print("[INFERENCE RESULT]")
            print(json.dumps(inference_result, default=str,
                             indent=2, ensure_ascii=False))
        except Exception:
            print("[INFERENCE RESULT] (failed to pretty-print)",
                  inference_result)

        # Extraction : privilégie le champ canonique 'top_score' si présent,
        # sinon tombe back sur le parsing défensif de la première prédiction.
        recognition_percentage = None
        try:
            if inference_result.get("top_score") is not None:
                recognition_percentage = float(
                    inference_result.get("top_score")
                    )
            else:
                preds = inference_result.get("predictions") or []
                if len(preds) > 0:
                    top = preds[0]
                    for k in ("probability", "score", "confidence", "prob"):
                        if k in top:
                            recognition_percentage = float(top[k])
                            break
        except Exception:
            recognition_percentage = None

        print(inference_result.get("top_label"))
        print(room_catalog.find_by_name(
            inference_result.get("top_label")
        ))

        room_obj = room_catalog.find_by_name(
            inference_result.get("top_label")
        )
        picture_payload = {
            "path": str(dest_path),
            "analyzed_by": inference_result.get("model_version")
                or inference_result.get("model") or None,
            "room": room_obj,  # passer l'objet Room
            "recognition_percentage": recognition_percentage,
            "analyse_date": datetime.now(timezone.utc),
            "validation_date": None,
            "is_validated": False,
            "room_id": room_obj.room_id if room_obj else None,  # facultatif mais ok
        }

        picture = Picture(**picture_payload)

        picture = picture_catalog.save(picture)
        return picture_to_pictureDTO_mapper.apply(picture)

    async def find_picture_to_validate(
        self,
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
        room_catalog: RoomCatalog = Depends(get_room_catalog),
    ):
        pictures = picture_catalog.find_by_not_validated()
        return [picture_to_picturePvaDTO_mapper.apply(picture) for picture in pictures]

    async def validate_pictures(
        self,
        pictures: list[PicturePvaDTO],
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
    ):
        validation_date = datetime.now(timezone.utc)

        print(f"Validating {len(pictures)} pictures at {validation_date}")

        updated_pictures = []

        for picture in pictures:
            try:
                updated = picture_catalog.update(
                    picture.id,
                    {"validation_date": validation_date, "is_validated": True},
                )
                updated_pictures.append(
                    picture_to_pictureDTO_mapper.apply(updated)
                )
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Erreur lors de la validation de {picture.id}: {str(e)}"
                )

        return updated_pictures

    async def recover_picture(
        self,
        picture_id: uuid.UUID = FastAPIPath(
            ..., description="ID de la picture à récupérer"
        ),
        type: Literal["thumbnail", "full"] = Query(
            "full",
            description="Type d'image à récupérer",
        ),
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
    ):
        picture = picture_catalog.find_by_id(picture_id)

        image = Image.open(picture.path)

        # A supprimer après que le resizing soit en place partout
        if image.size != (384, 384):
            image = image.resize((384, 384))

        if type == "thumbnail":
            image.thumbnail((150, 150))

        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=100)
        buffer.seek(0)

        return StreamingResponse(buffer, media_type="image/jpeg")

    async def delete_pictures_pva(
        self,
        pictures: list[PicturePvaDTO] = Body(...),
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
    ):
        deleted_pictures = []

        for picture in pictures:
            try:
                pic_obj = picture_catalog.find_by_id(picture.id)
                if pic_obj:
                    picture_catalog.delete(picture.id)
                    try:
                        Path(pic_obj.path).unlink()
                    except Exception as e:
                        print(f"Erreur lors de la suppression du fichier {pic_obj.path}: {e}")
                    deleted_pictures.append(picture.id)
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Erreur lors de la suppression de {picture.id}: {str(e)}"
                )

        return {"deleted_pictures": deleted_pictures}

    async def update_room_pva(
        self,
        pictures: list[PicturePvaDTO],
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
        room_catalog: RoomCatalog = Depends(get_room_catalog),
    ):
        updated_pictures = []
        validation_date = datetime.now(timezone.utc)

        for picture in pictures:
            try:
                if not picture.room or not picture.room.id:
                    raise HTTPException(
                        status_code=400,
                        detail=f"room.id manquant pour {picture.id}"
                    )

                room = room_catalog.find_by_id(picture.room.id)
                if not room:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Salle '{picture.room.id}' non trouvée"
                    )

                pic = picture_catalog.find_by_id(picture.id)
                if not pic:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Image '{picture.id}' non trouvée"
                    )

                pic.room = room

                pic.validation_date = validation_date
                pic.is_validated = True

                updated = picture_catalog.save(pic)

                updated_pictures.append(
                    picture_to_picturePvaDTO_mapper.apply(updated)
                )

            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Erreur lors de la mise à jour de {picture.id}: {str(e)}"
                )

        return updated_pictures

picture_controller = PictureController()
router = picture_controller.router
