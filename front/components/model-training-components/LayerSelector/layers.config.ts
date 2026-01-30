import { ScratchLayersDTO } from "@/api/DTO/scratchLayers.dto";

export type LayerKey = keyof ScratchLayersDTO;

export interface LayerInfo {
  key: LayerKey;
  label: string;
  description: string;
}

export const LAYERS: LayerInfo[] = [
  {
    key: "conv1",
    label: "Conv2D (3→32)",
    description: "Première couche convolutionnelle",
  },
  {
    key: "conv2",
    label: "Conv2D (32→64)",
    description: "Deuxième couche convolutionnelle",
  },
  {
    key: "pooling",
    label: "MaxPooling",
    description: "Couches de pooling après chaque convolution",
  },
  {
    key: "fc1",
    label: "Dense (128)",
    description: "Couche fully connected intermédiaire",
  },
  {
    key: "dropout",
    label: "Dropout (0.5)",
    description: "Régularisation pour éviter le surapprentissage",
  },
];
