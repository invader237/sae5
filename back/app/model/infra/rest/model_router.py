from fastapi import APIRouter, Depends, HTTPException, status
from app.model.domain.catalog.model_catalog import ModelCatalog
from app.model.domain.DTO.modelDTO import ModelDTO
from app.model.infra.factory.model_factory import get_model_catalog
from app.model.infra.factory.model_factory import get_model_loader
from app.model.domain.service.model_loader import ModelLoader
from app.model.domain.mapper.model_to_modelDTO_mapper import (
    model_to_modelDTO_mapper,
)
from app.authentification.core.admin_required import (
    require_role,
    AuthenticatedUser,
)


class ModelController:
    def __init__(self):
        self.router = APIRouter(
            prefix="/models",
            tags=["models"],
        )

        self.router.add_api_route(
            "/",
            self.get_models,
            response_model=list[dict],
            methods=["GET"],
        )

        self.router.add_api_route(
            "/",
            self.set_active_model,
            response_model=dict,
            methods=["POST"],
        )

        self.router.add_api_route(
            "/scan",
            self.scan_models,
            response_model=dict,
            methods=["POST"],
        )

    def get_models(
        self,
        model_catalog: ModelCatalog = Depends(get_model_catalog),
    ):
        models = model_catalog.find_all()
        return [model_to_modelDTO_mapper.apply(m).dict() for m in models]

    def set_active_model(
        self,
        model_to_activate: ModelDTO,
        model_catalog: ModelCatalog = Depends(get_model_catalog),
        user: AuthenticatedUser = Depends(require_role("admin")),
    ):
        try:
            # Désactiver l'ancien modèle actif
            active_model = model_catalog.find_active_model()
            if active_model:
                active_model.is_active = False
                model_catalog.save(active_model)

            # Activer le nouveau modèle
            model = model_catalog.find_by_id(model_to_activate.id)
            model.is_active = True
            model_catalog.save(model)

            return {
                "message": "Modèle activé", "id": str(model_to_activate.id)
            }

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e),
            )

    def scan_models(
        self,
        model_loader: ModelLoader = Depends(get_model_loader),
        user: AuthenticatedUser = Depends(require_role("admin")),
    ):
        """Scanne le dossier de modèles et met à jour la base"""
        try:
            model_loader.scan_and_load()
            return {"message": "Scan terminé avec succès"}
        except Exception as e:
            print(f"[ERROR] Erreur lors du scan : {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e),
            )


model_controller = ModelController()
router = model_controller.router
