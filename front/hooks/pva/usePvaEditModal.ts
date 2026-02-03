import { useCallback, useEffect, useState } from "react";
import { fetchRoomsForPva } from "@/api/room.api";
import { updateRoomForPictures } from "@/api/picture.api";
import RoomLightDTO from "@/api/DTO/roomLight.dto";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";

type UsePvaEditModalOptions = {
  visible: boolean;
  selectedPictures: PicturePvaDTO[];
  onUpdated?: () => Promise<void> | void;
  onClose: () => void;
};

export function usePvaEditModal({
  visible,
  selectedPictures,
  onUpdated,
  onClose,
}: UsePvaEditModalOptions) {
  const [rooms, setRooms] = useState<RoomLightDTO[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    const fetchRooms = async () => {
      try {
        const data = await fetchRoomsForPva();
        setRooms(data);
        if (data.length > 0) setSelectedRoomId(data[0].id);
      } catch (e) {
        console.error("Erreur récupération des salles :", e);
      }
    };

    void fetchRooms();
  }, [visible]);

  const handleConfirm = useCallback(async () => {
    try {
      if (!selectedRoomId) return;

      const updatedPayload = selectedPictures.map((pic) => ({
        ...pic,
        room: {
          ...pic.room,
          id: selectedRoomId,
        },
      }));

      await updateRoomForPictures(updatedPayload);
      await onUpdated?.();
      onClose();
    } catch (error) {
      console.error("Erreur mise à jour des salles :", error);
    }
  }, [selectedRoomId, selectedPictures, onUpdated, onClose]);

  return {
    rooms,
    selectedRoomId,
    setSelectedRoomId,
    handleConfirm,
  };
}
