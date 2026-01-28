import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ScratchLayersDTO } from "@/api/DTO/scratchLayers.dto";

type LayerKey = keyof ScratchLayersDTO;

interface LayerInfo {
  key: LayerKey;
  label: string;
  description: string;
}

const LAYERS: LayerInfo[] = [
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

type LayerCheckboxProps = {
  layer: LayerInfo;
  enabled: boolean;
  onToggle: (key: LayerKey) => void;
};

const LayerCheckbox: React.FC<LayerCheckboxProps> = ({ layer, enabled, onToggle }) => (
  <TouchableOpacity
    className={`m-1 p-3 rounded-xl border-2 ${
      enabled ? "bg-blue-50 border-blue-500" : "bg-white border-gray-300"
    }`}
    onPress={() => onToggle(layer.key)}
    activeOpacity={0.8}
  >
    <View className="flex-row items-center">
      <View
        className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${
          enabled ? "border-blue-500 bg-blue-500" : "border-gray-400"
        }`}
      >
        {enabled && <MaterialIcons name="check" size={14} color="white" />}
      </View>
      <View className="flex-1">
        <Text className={`font-medium ${enabled ? "text-blue-700" : "text-gray-800"}`}>
          {layer.label}
        </Text>
        <Text className="text-xs text-gray-500">{layer.description}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

type LayerSelectorProps = {
  layers: ScratchLayersDTO;
  onToggleLayer: (key: LayerKey) => void;
};

const LayerSelector: React.FC<LayerSelectorProps> = ({ layers, onToggleLayer }) => (
  <View>
    <View className="bg-gray-100 p-3 rounded-xl">
      {LAYERS.map((layer) => (
        <LayerCheckbox
          key={layer.key}
          layer={layer}
          enabled={layers[layer.key]}
          onToggle={onToggleLayer}
        />
      ))}
    </View>
  </View>
);

export default LayerSelector;
