export interface ModelStatsSummaryDTO {
  validated_images: number;
  avg_score: number;
}

export interface RoomLightDTO {
  id: string;
  name: string;
}

export interface ConfusionMatrixCellDTO {
  actual_room_id: string | null;
  predicted_room_id: string | null;
  count: number;
}

export interface AccuracyOverTimePointDTO {
  bucket: string; // ISO date string
  accuracy: number;
  total: number;
  correct: number;
}

export interface ModelStatsDetailedDTO {
  rooms: RoomLightDTO[];
  confusion_matrix: ConfusionMatrixCellDTO[];
  accuracy_global: number;
  accuracy_over_time: AccuracyOverTimePointDTO[];
}
