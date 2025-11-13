from fastapi import APIRouter, Depends, HTTPException, status
from app.model.domain.catalog.model_catalog import ModelCatalog
from app.model.infra.factory.model_factory import get_model_catalog
from app.model.infra.factory.model_factory import get_model_loader
from app.model.domain.service.model_loader import ModelLoader
from app.model.domain.mapper.model_to_modelDTO_mapper import (
    model_to_modelDTO_mapper,
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

    def scan_models(
        self,
        model_loader: ModelLoader = Depends(get_model_loader),
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
