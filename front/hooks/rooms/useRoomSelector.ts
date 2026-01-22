import { useCallback, useEffect, useState } from "react";
import { getRooms } from "@/api/room.api";
import  RoomDTO  from "@/api/DTO/room.dto";

type UseRoomSelectorOptions = {
  onSelectRoom: (room: RoomDTO | null) => void;
};

export function useRoomSelector({ onSelectRoom }: UseRoomSelectorOptions) {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    getRooms().then(setRooms).catch((error) => {
      console.error("Erreur chargement des salles :", error);
    });
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    const room = rooms.find((r) => r.id === id) ?? null;
    onSelectRoom(room);
  }, [rooms, onSelectRoom]);

  return {
    rooms,
    selectedId,
    handleSelect,
  };
}
