import os
from PIL import Image
from torch.utils.data import Dataset

class RoomDataset(Dataset):
    def __init__(self, records, images_dir, transform=None):
        """
        records = liste de dicts :
        [
            {"filename": "room1.png", "room": "F36"},
            ...
        ]
        """
        self.records = records
        self.images_dir = images_dir
        self.transform = transform

        # Création mapping label → id
        rooms = sorted({r["room"] for r in records})
        self.room_to_idx = {room: i for i, room in enumerate(rooms)}

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        record = self.records[idx]

        img_path = os.path.join(self.images_dir, record["filename"])
        image = Image.open(img_path).convert("RGB")

        label = self.room_to_idx[record["room"]]

        if self.transform:
            image = self.transform(image)

        return image, label
