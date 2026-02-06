export interface Prediction {
  label: string;
  score: number;
}

export interface InferenceResultDTO {
  predictions: Prediction[];
  model_version: string;
  accepted: boolean;
  time_ms: number;
  top_prediction?: Prediction;
  top_score?: number;
  top_label?: string;
  activation_token?: string;
  activation_images?: { name: string; url: string }[];
}
