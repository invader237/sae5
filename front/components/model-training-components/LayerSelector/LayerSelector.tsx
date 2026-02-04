import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ScratchLayersDTO } from "@/api/DTO/scratchLayers.dto";
import { LAYERS, LayerKey, LayerInfo } from "./layers.config";
import { Colors, BorderRadius } from "@/constants/theme";


type LayerCheckboxProps = {
  layer: LayerInfo;
  enabled: boolean;
  onToggle: (key: LayerKey) => void;
};

const LayerCheckbox: React.FC<LayerCheckboxProps> = ({ layer, enabled, onToggle }) => (
  <TouchableOpacity
    className="m-1 p-3"
    style={{
      backgroundColor: enabled ? Colors.infoLight : Colors.cardBackground,
      borderWidth: 2,
      borderColor: enabled ? Colors.info : Colors.border,
      borderRadius: BorderRadius.lg,
    }}
    onPress={() => onToggle(layer.key)}
    activeOpacity={0.8}
  >
    <View className="flex-row items-center">
      <View
        className="w-5 h-5 border-2 rounded mr-3 items-center justify-center"
        style={{
          borderColor: enabled ? Colors.info : Colors.textMuted,
          backgroundColor: enabled ? Colors.info : "transparent",
        }}
      >
        {enabled && <MaterialIcons name="check" size={14} color="white" />}
      </View>
      <View className="flex-1">
        <Text
          className="font-medium"
          style={{ color: enabled ? Colors.info : Colors.text }}
        >
          {layer.label}
        </Text>
        <Text className="text-xs" style={{ color: Colors.textSecondary }}>
          {layer.description}
        </Text>
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
    <View
      className="p-3"
      style={{
        backgroundColor: Colors.inputBackground,
        borderRadius: BorderRadius.lg,
      }}
    >
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
