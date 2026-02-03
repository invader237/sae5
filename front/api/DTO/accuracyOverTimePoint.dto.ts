export interface AccuracyOverTimePointDTO {
  bucket: string; // ISO date string
  accuracy: number;
  total: number;
  correct: number;
}
