import torch
import torch.nn as nn
import torchvision.models as models
from torch.utils.data import DataLoader
from torchvision import transforms
from pathlib import Path
import json
import re
import logging
from typing import Literal, Optional

from app.model.domain.service.room_dataset import RoomDataset
from app.model.domain.DTO.modelTrainingDTO import ModelTrainingDTO
from app.model.domain.DTO.scratchLayersDTO import ScratchLayersDTO

# -----------------------------------------------------------------------------
# Logging configuration
# -----------------------------------------------------------------------------
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("model-training")

# -----------------------------------------------------------------------------
# Paths
# -----------------------------------------------------------------------------
UPLOAD_DIR = Path("./")
MODEL_DIR = Path("/app/models")
MODEL_DIR.mkdir(parents=True, exist_ok=True)


class ModelTraining:

    def __init__(
        self,
        room_catalog,
        model_catalog,
        picture_catalog,
        model_namer,
        model_name="base",
        num_classes=None
    ):
        self.room_catalog = room_catalog
        self.model_catalog = model_catalog
        self.picture_catalog = picture_catalog
        self.model_namer = model_namer
        self.model_name = model_name
        self.num_classes = num_classes

        self.model = None
        self.dataset = None
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        logger.info("ModelTraining initialized | device=%s", self.device)

    # -------------------------------------------------------------------------
    # 1️⃣ Fetch records
    # -------------------------------------------------------------------------
    def fetch_records(self, rooms):
        logger.info("Fetching records...")
        logger.debug("Rooms input: %s", rooms)

        pictures = []
        page_limit = 500

        for room in rooms or []:
            offset = 0
            while True:
                page = self.picture_catalog.find_validated_by_room_id(
                    room_id=room.room_id,
                    limit=page_limit,
                    offset=offset,
                )
                if not page:
                    break

                pictures.extend(page)

                if len(page) < page_limit:
                    break

                offset += page_limit

        logger.info("Total pictures fetched: %d", len(pictures))

        records = []
        for pic in pictures:
            if pic.room is None:
                logger.error("Picture %s has no associated room", pic.id)
                raise ValueError(f"Picture {pic.id} has no associated room")

            records.append({
                "filename": pic.path,
                "room": pic.room.name
            })

        logger.info("Records created: %d", len(records))
        return records

    # -------------------------------------------------------------------------
    # 2️⃣ Transforms
    # -------------------------------------------------------------------------
    def get_transforms(self):
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor()
        ])

    # -------------------------------------------------------------------------
    # 3️⃣ Dataset creation
    # -------------------------------------------------------------------------
    def create_dataset(self, records):
        logger.info("Creating dataset...")
        logger.debug("Records count: %d", len(records))

        dataset = RoomDataset(
            records=records,
            images_dir=UPLOAD_DIR,
            transform=self.get_transforms()
        )

        # Sanity check
        try:
            img, label = dataset[0]
            logger.debug(
                "Dataset sample OK | image=%s | label=%s",
                tuple(img.shape),
                label
            )
        except Exception:
            logger.exception("Dataset sanity check failed")
            raise

        logger.info(
            "Dataset ready | samples=%d | classes=%d",
            len(dataset),
            len(dataset.room_to_idx)
        )
        return dataset

    # -------------------------------------------------------------------------
    # 4️⃣ Build dataset
    # -------------------------------------------------------------------------
    def build_dataset(self, rooms):
        if self.dataset is None:
            logger.info("Building dataset...")
            records = self.fetch_records(rooms)

            if not records:
                logger.error("No records found → dataset empty")
                raise ValueError("Dataset is empty")

            self.dataset = self.create_dataset(records)

        return self.dataset

    # -------------------------------------------------------------------------
    # 5️⃣ Model initialization
    # -------------------------------------------------------------------------
    def init_model(
        self,
        modelType: Literal["base", "scratch"] = "base",
        scratch_layers: Optional[ScratchLayersDTO] = None
    ):
        if self.dataset is None:
            raise ValueError("Dataset must be built first")

        if self.num_classes is None:
            self.num_classes = len(self.dataset.room_to_idx)

        logger.info(
            "Initializing model | type=%s | num_classes=%d",
            modelType,
            self.num_classes
        )

        if modelType == "base":
            model = models.resnet50(
                weights=models.ResNet50_Weights.IMAGENET1K_V1
            )
            model.fc = nn.Linear(model.fc.in_features, self.num_classes)

        elif modelType == "scratch":
            model = self._build_scratch_model(scratch_layers)

        else:
            raise ValueError(f"Unknown model type: {modelType}")

        self.model = model
        logger.debug("Model architecture:\n%s", self.model)
        return model

    def _build_scratch_model(
        self,
        layers_config: Optional[ScratchLayersDTO] = None
    ) -> nn.Module:

        if layers_config is None:
            layers_config = ScratchLayersDTO()

        layers = []
        current_channels = 3

        if layers_config.conv1:
            layers += [
                nn.Conv2d(current_channels, 32, 3, 1, 1),
                nn.ReLU(),
            ]
            current_channels = 32
            if layers_config.pooling:
                layers.append(nn.MaxPool2d(2))

        if layers_config.conv2:
            layers += [
                nn.Conv2d(current_channels, 64, 3, 1, 1),
                nn.ReLU(),
            ]
            current_channels = 64
            if layers_config.pooling:
                layers.append(nn.MaxPool2d(2))

        layers += [
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
        ]

        if layers_config.fc1:
            layers += [
                nn.Linear(current_channels, 128),
                nn.ReLU(),
                nn.Linear(128, self.num_classes),
            ]
        else:
            layers.append(nn.Linear(current_channels, self.num_classes))

        model = nn.Sequential(*layers)
        logger.info("Scratch model built")
        return model

    # -------------------------------------------------------------------------
    # 6️⃣ Dataloader
    # -------------------------------------------------------------------------
    def create_dataloader(self, batch_size=8, shuffle=True):
        dataloader = DataLoader(
            self.dataset,
            batch_size=batch_size,
            shuffle=shuffle
        )

        logger.info(
            "DataLoader created | batches=%d | batch_size=%d",
            len(dataloader),
            batch_size
        )

        if len(dataloader) == 0:
            raise ValueError("Empty DataLoader")

        return dataloader

    # -------------------------------------------------------------------------
    # 7️⃣ Optimizer & loss
    # -------------------------------------------------------------------------
    def create_optimizer(self, lr=1e-4):
        logger.info("Optimizer: Adam | lr=%f", lr)
        return torch.optim.Adam(self.model.parameters(), lr=lr)

    def create_loss(self):
        logger.info("Loss: CrossEntropyLoss")
        return nn.CrossEntropyLoss()

    # -------------------------------------------------------------------------
    # 8️⃣ Training epoch
    # -------------------------------------------------------------------------
    def train_epoch(self, dataloader, optimizer, loss_fn):
        self.model.train()
        running_loss = 0.0

        for batch_idx, (images, labels) in enumerate(dataloader):
            logger.debug(
                "Batch %d | images=%s | labels=%s",
                batch_idx,
                tuple(images.shape),
                labels.unique().tolist()
            )

            images = images.to(self.device)
            labels = labels.to(self.device)

            optimizer.zero_grad()

            outputs = self.model(images)
            logger.debug("Outputs shape: %s", tuple(outputs.shape))

            loss = loss_fn(outputs, labels)
            logger.debug("Loss: %.6f", loss.item())

            loss.backward()

            grad_norm = sum(
                p.grad.norm().item()
                for p in self.model.parameters()
                if p.grad is not None
            )
            logger.debug("Gradient norm: %.6f", grad_norm)

            optimizer.step()
            running_loss += loss.item() * images.size(0)

        return running_loss / len(dataloader.dataset)

    # -------------------------------------------------------------------------
    # 9️⃣ Save model & labels
    # -------------------------------------------------------------------------
    def save_model(self, filename):
        filepath = MODEL_DIR / f"{filename}.pth"
        logger.info("Saving model to %s", filepath)

        scripted = torch.jit.script(self.model)
        scripted.save(filepath)

        logger.info("Model saved successfully")
        return filepath

    def save_labels(self, filename):
        labels = list(self.dataset.room_to_idx.keys())
        filepath = MODEL_DIR / f"{filename}-label.json"

        with open(filepath, "w") as f:
            json.dump({"classes": labels}, f, indent=2)

        logger.info("Labels saved to %s", filepath)
        return filepath

    # -------------------------------------------------------------------------
    # 🔟 Full training
    # -------------------------------------------------------------------------
    def train(self, dto: ModelTrainingDTO, save=True):
        logger.info("Training started")

        rooms = []
        for room_dto in dto.roomList:
            room = self.room_catalog.find_by_id(room_dto.id)
            logger.debug("Loaded room: %s", room)
            rooms.append(room)

        self.build_dataset(rooms)
        self.init_model(dto.type, dto.scratchLayers)
        self.model.to(self.device)

        dataloader = self.create_dataloader(dto.batchSize)
        optimizer = self.create_optimizer(dto.learningRate)
        loss_fn = self.create_loss()

        for epoch in range(dto.epochs):
            loss = self.train_epoch(dataloader, optimizer, loss_fn)
            logger.info(
                "Epoch %d/%d | loss=%.6f",
                epoch + 1,
                dto.epochs,
                loss
            )

        model_name = self.model_namer.find_next_model_name(variant=dto.type)

        if save:
            self.save_model(model_name)
            self.save_labels(model_name)

        logger.info("Training completed successfully")
