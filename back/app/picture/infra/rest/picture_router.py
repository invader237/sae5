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
from fastapi.responses import StreamingResponse
from PIL import Image
from pathlib import Path
from typing import Literal, Optional, List
import io
import uuid
from datetime import datetime, timezone

from pydantic import BaseModel

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

from app.model.domain.service.predict import (
    predict_image,
    load_model,
    PREPROCESS_CACHE,
)
from app.model.domain.service.activations import generate_activations
from app.model.infra.factory.model_factory import get_model_catalog
from app.model.domain.catalog.model_catalog import ModelCatalog

from app.authentification.core.admin_required import (
    require_role,
    AuthenticatedUser,
    optional_user,
)

from app.history.infra.factory.history_factory import get_history_catalog
from app.history.domain.entity.history import History
from app.config import settings


UPLOAD_DIR = Path("uploads")


class ActivationsRequestDTO(BaseModel):
    layers: Optional[List[str]] = None
    include_heatmaps: bool = True
    include_overlays: bool = True


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
            methods=["POST"],
        )
        self.router.add_api_route(
            "/to-validate",
            self.find_picture_to_validate,
            response_model=list[PicturePvaDTO],
            methods=["GET"],
        )
        self.router.add_api_route(
            "/to-validate/count",
            self.count_picture_to_validate,
            response_model=dict,
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
            "/pva/status",
            self.get_pva_status,
            response_model=dict,
            methods=["GET"],
        )
        self.router.add_api_route(
            "/pva/status",
            self.toggle_pva_status,
            response_model=dict,
            methods=["PATCH"],
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
        self.router.add_api_route(
            "/validated/by-room/{room_id}",
            self.get_validated_pictures_by_room,
            response_model=list[PicturePvaDTO],
            methods=["GET"],
        )

        # Activation visualisations (static files)
        self.router.add_api_route(
            "/activations/{token}",
            self.list_activation_images,
            methods=["GET"],
        )
        self.router.add_api_route(
            "/activations/{token}/image/{filename}",
            self.get_activation_image,
            methods=["GET"],
        )

        # Activations generation (decoupled from inference)
        self.router.add_api_route(
            "/{picture_id}/activations",
            self.generate_picture_activations,
            methods=["POST"],
        )

    def get_pictures(
        self,
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
    ):
        pictures = picture_catalog.find_all()
        return [picture_to_pictureDTO_mapper.apply(p) for p in pictures]

    async def import_picture(
        self,
        type: Optional[Literal["analyse", "database"]] = Query(
            None,
            alias="type",
            description="Type d'import",
        ),
        type_form: Optional[Literal["analyse", "database"]] = Form(
            None,
            alias="type",
            description="Type d'import (form)",
        ),
        file: UploadFile | None = File(None),
        image: UploadFile | None = File(None),
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
        room_catalog: RoomCatalog = Depends(get_room_catalog),
        model_catalog: ModelCatalog = Depends(get_model_catalog),
        history_catalog=Depends(get_history_catalog),
        user: AuthenticatedUser | None = Depends(optional_user()),
    ):
        upload_file = file or image
        if upload_file is None:
            raise HTTPException(
                status_code=422,
                detail="Champ 'file' manquant (ou 'image')",
            )

        import_type_value = type or type_form
        if import_type_value is None:
            raise HTTPException(
                status_code=422,
                detail="Paramètre 'type' requis (analyse|database)",
            )

        if upload_file.content_type not in {"image/jpeg", "image/png", "image/jpg"}:
            raise HTTPException(
                status_code=400,
                detail="Type de fichier non supporté",
            )

        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        extension = Path(upload_file.filename).suffix or ".jpg"
        filename = f"{uuid.uuid4()}{extension}"
        dest_path = UPLOAD_DIR / filename

        contents = await upload_file.read()

        # Resize to 384x384 for consistent inference
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img = img.resize((384, 384))

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=100, optimize=True)
        resized_bytes = buffer.getvalue()

        if settings.PVA_ENABLED:
            # Persist the resized image
            dest_path.write_bytes(resized_bytes)

        # Inference only (no activations here)
        try:
            inference_result = predict_image(
                image_bytes=resized_bytes,
                top_k=5,
                confidence_threshold=0.0,
                catalog=model_catalog,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Inference failed: {exc}",
            )

        recognition_percentage = None
        try:
            top_score = inference_result.get("top_score")
            if top_score is not None:
                recognition_percentage = float(top_score)
            else:
                preds = inference_result.get("predictions") or []
                if preds:
                    recognition_percentage = float(preds[0].get("score", 0.0))
        except Exception:
            recognition_percentage = None

        if settings.PVA_ENABLED:
            room_obj = room_catalog.find_by_name(
                inference_result.get("top_label"))
            picture_payload = {
                "path": str(dest_path),
                "analyzed_by": inference_result.get(
                    "model_version") or inference_result.get("model") or None,
                "room": room_obj,
                "recognition_percentage": recognition_percentage,
                "analyse_date": datetime.now(timezone.utc),
                "validation_date": None,
                "is_validated": False,
                "room_id": room_obj.room_id if room_obj else None,
            }

            picture = Picture(**picture_payload)
            picture = picture_catalog.save(picture)

            if user is not None:
                try:
                    active_model = model_catalog.find_active_model()
                    model_id = active_model.model_id if active_model else None
                    room_id = room_obj.room_id if room_obj else None
                    history_catalog.save(
                        History(
                            room=room_obj,
                            room_id=room_id,
                            image_id=picture.image_id,
                            model_id=model_id,
                            user_id=user.user_id,
                        )
                    )
                except Exception as e:
                    print(
                        "[WARNING] Erreur lors de la sauvegarde historique: "
                        f"{e}")

        return inference_result

    async def generate_picture_activations(
        self,
        picture_id: uuid.UUID = FastAPIPath(
            ...,
            description="ID de l'image (picture_id)",
        ),
        payload: ActivationsRequestDTO = Body(...),
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
        model_catalog: ModelCatalog = Depends(get_model_catalog),
        user: AuthenticatedUser = Depends(require_role("admin")),
    ):
        picture = picture_catalog.find_by_id(picture_id)
        if not picture:
            raise HTTPException(status_code=404, detail="Picture not found")

        try:
            image_bytes = Path(picture.path).read_bytes()
        except Exception:
            raise HTTPException(status_code=400, detail="Cannot read picture file")

        active_model = model_catalog.find_active_model()
        if not active_model:
            raise HTTPException(
                status_code=500,
                detail="No active model configured",
            )

        model_version = active_model.path
        model = load_model(model_version)

        pc = PREPROCESS_CACHE.get(model_version, {}).copy()
        input_size = int(pc.get("size", active_model.input_size))
        mean = pc.get("mean")
        std = pc.get("std")

        layers_list: Optional[List[str]] = payload.layers or None
        include_heatmaps: bool = bool(payload.include_heatmaps)
        include_overlays: bool = bool(payload.include_overlays)

        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        try:
            activations_payload = generate_activations(
                model=model,
                image_bytes=image_bytes,
                input_size=input_size,
                mean=mean,
                std=std,
                layers=layers_list,
                include_heatmaps=include_heatmaps,
                include_overlays=include_overlays,
                uploads_dir=str(UPLOAD_DIR),
            )
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Activations failed: {exc}",
            )

        return {
            "picture_id": str(picture_id),
            "model_version": model_version,
            "activations": activations_payload,
        }

    async def find_picture_to_validate(
        self,
        limit: int = Query(50, ge=1, le=100),
        offset: int = Query(0, ge=0),
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
    ):
        pictures = picture_catalog.find_by_not_validated(limit=limit, offset=offset)
        return [picture_to_picturePvaDTO_mapper.apply(p) for p in pictures]

    async def get_pva_status(self):
        return {"enabled": settings.PVA_ENABLED}

    async def toggle_pva_status(
        self,
        body: dict = Body(...),
        user: AuthenticatedUser = Depends(require_role("admin")),
    ):
        enabled = body.get("enabled")
        if enabled is None or not isinstance(enabled, bool):
            raise HTTPException(
                status_code=422,
                detail="Le champ 'enabled' (bool) est requis.",
            )
        settings.PVA_ENABLED = enabled
        return {"enabled": settings.PVA_ENABLED}

    async def count_picture_to_validate(
        self,
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
    ):
        return {"count": picture_catalog.count_not_validated()}

    async def validate_pictures(
        self,
        pictures: list[PicturePvaDTO],
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
        user: AuthenticatedUser = Depends(require_role("admin")),
    ):
        validation_date = datetime.now(timezone.utc)
        updated_pictures = []

        for picture in pictures:
            try:
                picture_obj = picture_catalog.find_by_id(picture.id)
                picture_obj.validation_date = validation_date
                picture_obj.is_validated = True
                updated = picture_catalog.save(picture_obj)
                updated_pictures.append(picture_to_pictureDTO_mapper.apply(updated))
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail=f"Validation failed: {picture.id}",
                )

        return updated_pictures

    async def recover_picture(
        self,
        picture_id: uuid.UUID = FastAPIPath(
            ...,
            description="ID de la picture à récupérer",
        ),
        type: Literal["thumbnail", "full"] = Query(
            "full",
            description="Type d'image à récupérer",
        ),
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
    ):
        picture = picture_catalog.find_by_id(picture_id)
        image = Image.open(picture.path)

        if type == "thumbnail":
            max_size = (150, 150)
            quality = 70
        else:
            max_size = (384, 384)
            quality = 90

        image.thumbnail(max_size, Image.Resampling.LANCZOS)

        if image.mode != "RGB":
            image = image.convert("RGB")

        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=quality, optimize=True)
        buffer.seek(0)

        return StreamingResponse(buffer, media_type="image/jpeg")

    async def list_activation_images(self, token: str):
        act_dir = UPLOAD_DIR / "activations" / token
        if not act_dir.exists() or not act_dir.is_dir():
            raise HTTPException(
                status_code=404,
                detail="Activation token not found",
            )

        files = []
        for p in sorted(act_dir.iterdir()):
            if p.is_file() and p.suffix.lower() in (".png", ".jpg", ".jpeg"):
                files.append(
                    {
                        "name": p.name,
                        "url": f"/pictures/activations/{token}/image/{p.name}",
                    }
                )

        return {"token": token, "images": files}

    async def get_activation_image(self, token: str, filename: str):
        act_file = UPLOAD_DIR / "activations" / token / filename
        if not act_file.exists() or not act_file.is_file():
            raise HTTPException(
                status_code=404,
                detail="Activation image not found",
            )

        ext = act_file.suffix.lower()
        media_type = "image/jpeg" if ext in (".jpg", ".jpeg") else "image/png"

        try:
            f = act_file.open("rb")
            return StreamingResponse(f, media_type=media_type)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc))

    async def delete_pictures_pva(
        self,
        pictures: list[PicturePvaDTO] = Body(...),
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
        user: AuthenticatedUser = Depends(require_role("admin")),
    ):
        deleted_pictures = []
        for picture in pictures:
            try:
                pic_obj = picture_catalog.find_by_id(picture.id)
                if pic_obj:
                    picture_catalog.delete(picture.id)
                    try:
                        Path(pic_obj.path).unlink()
                    except Exception as exc:
                        print(f"Erreur suppression {pic_obj.path}: {exc}")
                    deleted_pictures.append(picture.id)
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail=f"Delete failed: {picture.id}",
                )

        return {"deleted_pictures": deleted_pictures}

    async def update_room_pva(
        self,
        pictures: list[PicturePvaDTO],
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
        room_catalog: RoomCatalog = Depends(get_room_catalog),
        user: AuthenticatedUser = Depends(require_role("admin")),
    ):
        updated_pictures = []
        validation_date = datetime.now(timezone.utc)

        for picture in pictures:
            try:
                if not picture.room or not picture.room.id:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Missing room.id for {picture.id}",
                    )

                room = room_catalog.find_by_id(picture.room.id)
                if not room:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Room not found: {picture.room.id}",
                    )

                pic = picture_catalog.find_by_id(picture.id)
                if not pic:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Picture not found: {picture.id}",
                    )

                pic.room = room
                pic.validation_date = validation_date
                pic.is_validated = True

                updated = picture_catalog.save(pic)
                updated_pictures.append(picture_to_picturePvaDTO_mapper.apply(updated))

            except HTTPException:
                raise
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail=f"Update failed: {picture.id}",
                )

        return updated_pictures

    async def get_validated_pictures_by_room(
        self,
        room_id: uuid.UUID = FastAPIPath(
            ...,
            description="ID de la salle (room_id)",
        ),
        limit: int = Query(500, ge=1, le=500),
        offset: int = Query(0, ge=0),
        picture_catalog: PictureCatalog = Depends(get_picture_catalog),
        user: AuthenticatedUser = Depends(require_role("admin")),
    ):
        pictures = picture_catalog.find_validated_by_room_id(
            room_id=room_id,
            limit=limit,
            offset=offset,
        )

        pictures = sorted(
            pictures,
            key=lambda p: (
                p.validation_date or datetime.min.replace(tzinfo=timezone.utc)
            ),
            reverse=True,
        )

        return [picture_to_picturePvaDTO_mapper.apply(p) for p in pictures]


picture_controller = PictureController()
router = picture_controller.router
