import RoomLightDTO from "./roomLight.dto";

export default interface ModelTrainingDTO {
  type: "base" | "scratch";
  epochs: number;
  batchSize: number;
  learningRate: number;
  roomList: RoomLightDTO[];
}

