export interface Prediction {
  label: string;
  score: number;
}

export interface InferenceResult {
  predictions: Prediction[];
  model_version: string;
  accepted: boolean;
  time_ms: number;
  top_prediction?: Prediction;
  top_score?: number;
  top_label?: string;
}