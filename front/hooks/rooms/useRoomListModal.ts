import { useCallback, useMemo, useState } from "react";
import RoomDTO from "@/api/DTO/room.dto";

type UseRoomListModalOptions = {
  rooms: RoomDTO[];
};

export function useRoomListModal({ rooms }: UseRoomListModalOptions) {
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      const diff = (a.validated_picture_count ?? 0) - (b.validated_picture_count ?? 0);
      if (diff !== 0) return diff;
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  }, [rooms]);

  const toggleExpanded = useCallback((roomId: string) => {
    setExpandedRoom((prev) => (prev === roomId ? null : roomId));
  }, []);

  return {
    expandedRoom,
    sortedRooms,
    toggleExpanded,
  };
}
