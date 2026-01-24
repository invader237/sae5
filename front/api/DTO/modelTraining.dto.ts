import RoomLightDTO from "./roomLight.dto";
import { ScratchLayersDTO } from "./scratchLayers.dto";



export default interface ModelTrainingDTO {
  type: "base" | "scratch";
  epochs: number;
  batchSize: number;
  learningRate: number;
  roomList: RoomLightDTO[];
  scratchLayers: ScratchLayersDTO;
}

