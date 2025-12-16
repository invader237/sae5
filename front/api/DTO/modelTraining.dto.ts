
export default interface ModelTrainingDTO {
  type: "base" | "scratch";
  epochs: number;
  batchSize: number;
  learningRate: number;
}

