import RoomLightDTO from "./roomLight.dto";
import { ConfusionMatrixCellDTO } from "./confusionMatrixCell.dto";
import { AccuracyOverTimePointDTO } from "./accuracyOverTimePoint.dto";

export interface ModelStatsSummaryDTO {
  validated_images: number;
  avg_score: number;
}

export interface ModelStatsDetailedDTO {
  rooms: RoomLightDTO[];
  confusion_matrix: ConfusionMatrixCellDTO[];
  accuracy_global: number;
  accuracy_over_time: AccuracyOverTimePointDTO[];
}

// Re-export for convenience
export type { ConfusionMatrixCellDTO, AccuracyOverTimePointDTO };
export type { default as RoomLightDTO } from "./roomLight.dto";
