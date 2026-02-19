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
from app.model.domain.service.model_training import ModelTraining
from app.model.infra.factory.model_factory import get_model_training
from app.model.domain.DTO.modelTrainingDTO import ModelTrainingDTO
from app.model.domain.DTO.modelStatsSummaryDTO import ModelStatsSummaryDTO
from app.model.domain.DTO.modelStatsDetailedDTO import ModelStatsDetailedDTO
from app.model.domain.service.model_stats_service import ModelStatsService
from app.model.infra.factory.model_factory import get_model_stats_service
from app.model.domain.catalog.layers_catalog import LayersCatalog
from app.model.infra.factory.model_factory import (
    get_layers_catalog,
)
from typing import Any, Dict, List
from app.model.domain.service.predict import load_model
from uuid import UUID


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

        self.router.add_api_route(
            "/train",
            self.train_model,
            methods=["POST"],
        )

        self.router.add_api_route(
            "/{model_id}/stats/summary",
            self.get_model_stats_summary,
            response_model=ModelStatsSummaryDTO,
            methods=["GET"],
        )

        self.router.add_api_route(
            "/{model_id}/stats/detailed",
            self.get_model_stats_detailed,
            response_model=ModelStatsDetailedDTO,
            methods=["GET"],
        )

        self.router.add_api_route(
            "/layers-catalog",
            self.get_layers_catalog,
            methods=["GET"],
        )

        self.router.add_api_route(
            "/active/layers",
            self.get_active_model_layers,
            methods=["GET"],
        )

        self.router.add_api_route(
            "/active/layers/preset",
            self.get_active_model_layers_preset,
            methods=["GET"],
        )

    def get_models(
        self,
        model_catalog: ModelCatalog = Depends(get_model_catalog),
        user: AuthenticatedUser = Depends(require_role("admin")),
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

    def train_model(
        self,
        model_training_dto: ModelTrainingDTO,
        model_training: ModelTraining = Depends(get_model_training),
        user: AuthenticatedUser = Depends(require_role("admin")),
    ):
        """Lance l'entraînement du modèle"""
        try:
            model_training.train(model_training_dto)
            return {"message": "Entraînement terminé avec succès"}
        except ValueError as e:
            print(f"[ERROR] Erreur de configuration : {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )
        except RuntimeError as e:
            msg = str(e)
            print(f"[ERROR] Erreur runtime lors de l'entraînement : {msg}")
            # Rendre les erreurs PyTorch plus lisibles
            if "mat1 and mat2 shapes cannot be multiplied" in msg:
                detail = (
                    "Les dimensions entre les couches sont incompatibles. "
                    "Vérifiez les paramètres in_channels/out_channels "
                    "et in_features/out_features de vos couches."
                )
            elif "spatial targets supported" in msg:
                detail = (
                    "Le modèle produit une sortie incompatible avec "
                    "la classification. Vérifiez l'architecture "
                    "de vos couches."
                )
            elif "negative dimensions" in msg or "invalid argument" in msg:
                detail = (
                    "Les paramètres des couches produisent des dimensions "
                    "invalides. Vérifiez les valeurs de kernel_size, "
                    "stride et padding."
                )
            else:
                detail = f"Erreur lors de l'entraînement : {msg}"
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=detail,
            )
        except Exception as e:
            print(f"[ERROR] Erreur inattendue : {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Une erreur inattendue est survenue lors de "
                    "l'entraînement. Consultez les logs du serveur."
                ),
            )

    def get_model_stats_summary(
        self,
        model_id: UUID,
        model_stats_service: ModelStatsService = Depends(
            get_model_stats_service
        ),
        user: AuthenticatedUser = Depends(require_role("admin")),
    ) -> ModelStatsSummaryDTO:
        return model_stats_service.get_summary(model_id)

    def get_model_stats_detailed(
        self,
        model_id: UUID,
        model_stats_service: ModelStatsService = Depends(
            get_model_stats_service
        ),
        user: AuthenticatedUser = Depends(require_role("admin")),
    ) -> ModelStatsDetailedDTO:
        return model_stats_service.get_detailed(model_id)

    def get_layers_catalog(
        self,
        layers_catalog: LayersCatalog = Depends(
            get_layers_catalog
        ),
        user: AuthenticatedUser = Depends(require_role("admin")),
    ):
        """Retourne le catalogue de couches PyTorch disponibles"""
        try:
            return layers_catalog.get_all_layers()
        except Exception as e:
            print(
                f"[ERROR] Erreur chargement catalogue : {e}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e),
            )

    def _recommended_layers(
            self,
            all_layers: List[str],
            size: int = 8) -> List[str]:

        preset8 = [
            "conv1",
            "layer1.0.conv1",
            "layer1.2.conv3",
            "layer2.0.conv1",
            "layer2.3.conv3",
            "layer3.0.conv1",
            "layer3.5.conv3",
            "layer4.2.conv3",
        ]
        preset5 = [
            "conv1",
            "layer2.0.conv1",
            "layer3.0.conv1",
            "layer4.2.conv3",
            "avgpool",
        ]

        preset = preset5 if size <= 5 else preset8
        return [x for x in preset if x in all_layers]

    def get_active_model_layers(
        self,
        model_catalog: ModelCatalog = Depends(get_model_catalog),
        user: AuthenticatedUser = Depends(require_role("admin")),
    ) -> Dict[str, Any]:
        active = model_catalog.find_active_model()
        if not active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active model",
            )

        # Active model path is used as model_version in your codebase
        model_version = active.path
        model = load_model(model_version)

        all_layers = [name for name, _ in model.named_modules() if name]
        recommended = self._recommended_layers(all_layers, size=8)

        # Step-by-step info: first-level children with their type
        steps = [
            {
                "step": idx,
                "name": name,
                "display_name": type(mod).__name__,
            }
            for idx, (name, mod) in enumerate(model.named_children())
        ]

        return {
            "model_version": model_version,
            "layers": all_layers,
            "recommended": recommended,
            "steps": steps,
        }

    def get_active_model_layers_preset(
        self,
        size: int = 8,
        model_catalog: ModelCatalog = Depends(get_model_catalog),
        user: AuthenticatedUser = Depends(require_role("admin")),
    ) -> Dict[str, Any]:
        active = model_catalog.find_active_model()
        if not active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active model",
            )

        model_version = active.path
        model = load_model(model_version)
        all_layers = [name for name, _ in model.named_modules() if name]

        return {
            "model_version": model_version,
            "recommended": self._recommended_layers(all_layers, size=size),
        }


model_controller = ModelController()
router = model_controller.router
