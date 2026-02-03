import { ScratchLayersDTO } from "@/api/DTO/scratchLayers.dto";

export const DEFAULT_SCRATCH_LAYERS: ScratchLayersDTO = {
  conv1: true,
  conv2: true,
  pooling: true,
  fc1: true,
  dropout: false,
};
