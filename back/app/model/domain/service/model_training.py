import torch
import torch.nn as nn
import torchvision.models as models
from torch.utils.data import DataLoader
from torchvision import transforms
from pathlib import Path
from app.model.domain.service.room_dataset import RoomDataset
import json
import re
from app.model.domain.DTO.modelTrainingDTO import ModelTrainingDTO
from typing import Literal

UPLOAD_DIR = Path("./")
MODEL_DIR = Path("/app/models")
MODEL_DIR.mkdir(parents=True, exist_ok=True)  # create folder if not exists


class ModelTraining:
    def __init__(self,
                 room_catalog,
                 model_catalog,
                 picture_catalog,
                 model_name="base",
                 num_classes=None
                 ):
        self.room_catalog = room_catalog
        self.model_catalog = model_catalog
        self.picture_catalog = picture_catalog
        self.model_name = model_name
        self.num_classes = num_classes
        self.model = None
        self.dataset = None
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

    # 1️⃣ Fetch records
    def fetch_records(self, rooms):
        print("[DEBUG] fetch_records called")
        print("[DEBUG] rooms param:", rooms)

        pictures = self.picture_catalog.find_all_validated_by_room_ids(rooms)
        print("[DEBUG] pictures count:", len(pictures))

        records = []
        for pic in pictures:
            if pic.room is None:
                raise ValueError(
                    f"Picture {pic.id} has no associated room"
                )

            records.append({
                "filename": pic.path,
                "room": pic.room.name
            })

        print("[DEBUG] records count:", len(records))
        return records

    # 2️⃣ Define transforms
    def get_transforms(self):
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor()
        ])

    # 3️⃣ Create Dataset
    def create_dataset(self, records):
        transform = self.get_transforms()
        dataset = RoomDataset(
            records=records,
            images_dir=UPLOAD_DIR,
            transform=transform
        )
        return dataset

    # 4️⃣ Build Dataset
    def build_dataset(self, rooms):
        if self.dataset is None:
            records = self.fetch_records(rooms)
            self.dataset = self.create_dataset(records)
        return self.dataset

    # 5️⃣ Initialize Model
    def init_model(self, modelType: Literal["base", "scratch"] = "base"):
        if self.dataset is None:
            raise ValueError(
                "Dataset must be built before initializing model"
            )
        if self.num_classes is None:
            self.num_classes = len(self.dataset.room_to_idx)

        if modelType == "base":
            print("[DEBUG] Initializing pre-trained ResNet50 model")
            model = models.resnet50(
                weights=models.ResNet50_Weights.IMAGENET1K_V1
            )
            model.fc = nn.Linear(model.fc.in_features, self.num_classes)

        elif modelType == "scratch":
            print("[DEBUG] Initializing model from scratch")
            model = nn.Sequential(
                nn.Conv2d(3, 32, 3, 1, 1),  # input channels,
                # output channels, kernel size, stride, padding
                nn.ReLU(),  # activation
                nn.MaxPool2d(2),  # pooling
                nn.Conv2d(32, 64, 3, 1, 1),  # second conv layer
                nn.ReLU(),  # activation
                nn.MaxPool2d(2),  # pooling
                nn.AdaptiveAvgPool2d((1, 1)),  # adaptive pooling
                nn.Flatten(),  # flatten for fully connected layers
                nn.Linear(64, 128),  # fully connected layer
                # nn.Flatten(),  # flatten for fully connected layers
                # nn.Linear(64 * 56 * 56, 128),  # fully connected layer
                nn.ReLU(),  # activation
                nn.Linear(128, self.num_classes)  # output layer
            )
        else:
            raise ValueError(f"Unknown model name: {self.model_name}")

        self.model = model
        print(
            f"Initialized model: {self.model_name} "
            f"with {self.num_classes} classes"
        )
        return model

    # 6️⃣ Create DataLoader
    def create_dataloader(self, batch_size=8, shuffle=True):
        return DataLoader(self.dataset, batch_size=batch_size, shuffle=shuffle)

    # 7️⃣ Create optimizer
    def create_optimizer(self, lr=1e-4):
        return torch.optim.Adam(self.model.parameters(), lr=lr)

    # 8️⃣ Create loss function
    def create_loss(self):
        return torch.nn.CrossEntropyLoss()

    # 9 Train one epoch
    def train_epoch(self, dataloader, optimizer, loss_fn):
        self.model.train()  # set model to training mode
        running_loss = 0.0
        for images, labels in dataloader:
            images, labels = images.to(self.device), labels.to(self.device)
            optimizer.zero_grad()
            outputs = self.model(images)
            loss = loss_fn(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * images.size(0)
        epoch_loss = running_loss / len(dataloader.dataset)
        return epoch_loss

    # 10 find next model name
    def find_next_model_name(self, variant="base", major=0):
        """
        Extract the next available minor version from existing models.
        Logs all intermediate values for debugging.
        """
        scope = "neuroom"
        prefix = f"{scope}-{variant}-v{major}"
        max_minor = -1

        pattern = re.compile(rf"^{re.escape(prefix)}(?:\.(\d+))?$")

        models = self.model_catalog.find_all()

        for idx, model in enumerate(models):
            if not model.name:
                print("[DEBUG] Model has no name, skipping")
                continue
            name = model.name
            if name.endswith(".pth"):
                name = name[:-4]
            match = pattern.match(name)
            if match:
                minor_str = match.group(1)
                if minor_str is None:
                    minor = 0
                else:
                    minor = int(minor_str)
                max_minor = max(max_minor, minor)
            else:
                print("[DEBUG] Model did not match pattern")

        next_model_name = f"{prefix}.{max_minor + 1}"

        return next_model_name

    # 10 Save model
    def save_model(self, filename=None):
        """
        Save the trained model to disk.
        If filename is not provided, uses model_name.pt
        """
        if self.model is None:
            raise ValueError("Model is not initialized.")

        filename = filename or f"{self.model_name}.pth"
        filepath = MODEL_DIR / f"{filename}.pth"
        #torch.save(self.model.state_dict(), filepath)
        scripted = torch.jit.script(self.model)
        scripted.save(filepath)
        print(f"Model saved to {filepath}")
        return filepath

    # 11 Save labels
    def save_labels(self, filename=None):
        """
        Save the label mapping (room names → class indices) to labels.json
        """
        if self.dataset is None:
            raise ValueError(
                "Dataset is not built yet. Call build_dataset() first."
            )

        labels = list(self.dataset.room_to_idx.keys())
        data = {"classes": labels}

        # Directly define filename
        filename = f"{filename}-label.json"
        filepath = MODEL_DIR / filename

        # Ensure directory exists
        MODEL_DIR.mkdir(parents=True, exist_ok=True)

        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)

        print(f"Labels saved to {filepath}")
        return filepath

    # 12 Full training loop
    def train(self, modelTrainingDTO: ModelTrainingDTO, save: bool = True):
        print("[DEBUG] Rooms from DTO:", modelTrainingDTO.roomList)
        # Ensure dataset and model are built
        rooms = []
        for room_dto in modelTrainingDTO.roomList:
            room = self.room_catalog.find_by_id(room_dto.id)
            print("[DEBUG] Loaded room:", room, "id:", room.room_id)
            rooms.append(room)

        self.build_dataset(rooms)
        self.init_model(modelTrainingDTO.type)
        self.model.to(self.device)

        dataloader = self.create_dataloader(
            batch_size=modelTrainingDTO.batchSize
        )
        optimizer = self.create_optimizer(lr=modelTrainingDTO.learningRate)
        loss_fn = self.create_loss()

        for epoch in range(modelTrainingDTO.epochs):
            epoch_loss = self.train_epoch(dataloader, optimizer, loss_fn)
            print(
                f"Epoch {epoch + 1}/"
                f"{modelTrainingDTO.epochs} "
                f"- Loss: {epoch_loss:.4f}"
            )

        model_file_name = self.find_next_model_name(variant=self.model_name)

        if save:
            self.save_model(model_file_name)
            self.save_labels(model_file_name)

    print("Training completed.")
