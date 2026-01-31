export interface ConfusionMatrixCellDTO {
  actual_room_id: string | null;
  predicted_room_id: string | null;
  count: number;
}
