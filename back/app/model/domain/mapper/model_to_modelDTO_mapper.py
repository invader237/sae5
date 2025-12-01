from app.model.domain.DTO.modelDTO import ModelDTO
from app.model.domain.entity.model import Model


class ModelToModelDTOMapper:
    @staticmethod
    def apply(model: Model) -> ModelDTO:
        return ModelDTO(
            id=model.model_id,
            name=model.name,
            path=model.path,
            is_active=model.is_active,
            input_size=model.input_size,
        )


model_to_modelDTO_mapper = ModelToModelDTOMapper()
