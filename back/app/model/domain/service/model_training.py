import torch
import torch.nn as nn
import torchvision.models as models
from torch.utils.data import DataLoader
from torchvision import transforms
from pathlib import Path
from app.model.domain.service.room_dataset import RoomDataset
import json

UPLOAD_DIR = Path("./")
MODEL_DIR = Path("/app/models")
MODEL_DIR.mkdir(parents=True, exist_ok=True)  # create folder if not exists


class ModelTraining:
    def __init__(self, room_catalog, model_name="resnet50", num_classes=None):
        self.room_catalog = room_catalog
        self.model_name = model_name
        self.num_classes = num_classes
        self.model = None
        self.dataset = None
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

    # 1️⃣ Fetch records
    def fetch_records(self):
        records = []
        rooms = self.room_catalog.find_all_validated()
        for room in rooms:
            for picture in room.pictures:
                records.append({"filename": picture.path, "room": room.name})
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
    def build_dataset(self):
        if self.dataset is None:
            records = self.fetch_records()
            self.dataset = self.create_dataset(records)
        return self.dataset

    # 5️⃣ Initialize Model
    def init_model(self):
        # Build dataset if needed to infer num_classes
        self.build_dataset()
        if self.num_classes is None:
            self.num_classes = len(self.dataset.room_to_idx)

        if self.model_name.lower() == "resnet50":
            model = models.resnet50(
                weights=models.ResNet50_Weights.IMAGENET1K_V1
            )
            model.fc = nn.Linear(model.fc.in_features, self.num_classes)

        elif self.model_name.lower() == "custom_cnn":
            model = nn.Sequential(
                nn.Conv2d(3, 32, 3, 1, 1),  # input channels,
                # output channels, kernel size, stride, padding
                nn.ReLU(),  # activation
                nn.MaxPool2d(2),  # pooling
                nn.Conv2d(32, 64, 3, 1, 1),  # second conv layer
                nn.ReLU(),  # activation
                nn.MaxPool2d(2),  # pooling
                nn.Flatten(),  # flatten for fully connected layers
                nn.Linear(64 * 56 * 56, 128),  # fully connected layer
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

    # 10 Save model
    def save_model(self, filename=None):
        """
        Save the trained model to disk.
        If filename is not provided, uses model_name.pt
        """
        if self.model is None:
            raise ValueError("Model is not initialized.")

        filename = filename or f"{self.model_name}.pth"
        filepath = MODEL_DIR / filename
        torch.save(self.model.state_dict(), filepath)
        print(f"Model saved to {filepath}")
        return filepath

    # 11 Save labels
    def save_labels(self):
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
        filename = f"{self.model_name}-label.json"
        filepath = MODEL_DIR / filename

        # Ensure directory exists
        MODEL_DIR.mkdir(parents=True, exist_ok=True)

        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)

        print(f"Labels saved to {filepath}")
        return filepath

    # 12 Full training loop
    def train(self, epochs=1, batch_size=8, lr=1e-4, save=True):
        # Ensure dataset and model are built
        self.build_dataset()
        self.init_model()
        self.model.to(self.device)

        dataloader = self.create_dataloader(batch_size=batch_size)
        optimizer = self.create_optimizer(lr=lr)
        loss_fn = self.create_loss()

        for epoch in range(epochs):
            epoch_loss = self.train_epoch(dataloader, optimizer, loss_fn)
            print(f"Epoch {epoch+1}/{epochs} - Loss: {epoch_loss:.4f}")

        if save:
            self.save_model()
            self.save_labels()

        print("Training completed.")
