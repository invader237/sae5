import { useMemo } from "react";
import { ConfusionMatrixCellDTO } from "@/api/DTO/confusionMatrixCell.dto";
import RoomLightDTO from "@/api/DTO/roomLight.dto";

const MAX_ROOMS_DISPLAYED = 15;

interface UseConfusionMatrixParams {
  matrix: ConfusionMatrixCellDTO[];
  rooms: RoomLightDTO[];
}

export function useConfusionMatrix({ matrix, rooms }: UseConfusionMatrixParams) {
  return useMemo(() => {
    const roomMap = new Map(rooms.map((r) => [r.id, r.name]));
    const allRoomIds = rooms.map((r) => r.id);
    const isTruncated = allRoomIds.length > MAX_ROOMS_DISPLAYED;
    const displayedRoomIds = isTruncated
      ? allRoomIds.slice(0, MAX_ROOMS_DISPLAYED)
      : allRoomIds;

    // Build a 2D lookup: map[actual][predicted] = count
    const lookup = new Map<string, Map<string, number>>();
    matrix.forEach((cell) => {
      if (!cell.actual_room_id || !cell.predicted_room_id) return;
      if (!lookup.has(cell.actual_room_id)) {
        lookup.set(cell.actual_room_id, new Map());
      }
      lookup.get(cell.actual_room_id)!.set(cell.predicted_room_id, cell.count);
    });

    // Find max value for color scaling
    const maxCount = Math.max(...matrix.map((c) => c.count), 1);

    return {
      roomMap,
      displayedRoomIds,
      isTruncated,
      lookup,
      maxCount,
      totalRooms: rooms.length,
      maxRoomsDisplayed: MAX_ROOMS_DISPLAYED,
    };
  }, [matrix, rooms]);
}

export function getCellBackgroundColor(
  actualId: string,
  predictedId: string,
  count: number,
  maxCount: number
): string {
  const isDiagonal = actualId === predictedId;
  const intensity = count / maxCount;
  
  if (isDiagonal) {
    return `rgba(34, 197, 94, ${0.2 + intensity * 0.6})`;
  }
  if (count > 0) {
    return `rgba(239, 68, 68, ${0.2 + intensity * 0.5})`;
  }
  return "white";
}
