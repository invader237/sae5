import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { ConfiguredLayer } from "@/hooks/models/useCustomLayers";
import type { LayerCatalogItem } from "@/api/DTO/layerCatalog.dto";

type Props = {
  layer: ConfiguredLayer;
  index: number;
  totalLayers: number;
  catalogItem: LayerCatalogItem | undefined;
  onRemove: (id: string) => void;
  onUpdateParam: (id: string, paramKey: string, value: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  convolution: "#3b82f6",
  pooling: "#8b5cf6",
  linear: "#f59e0b",
  activation: "#10b981",
  regularization: "#ef4444",
  normalization: "#06b6d4",
  utility: "#6b7280",
};

const CustomLayerCard: React.FC<Props> = ({
  layer,
  index,
  totalLayers,
  catalogItem,
  onRemove,
  onUpdateParam,
  onMoveUp,
  onMoveDown,
}) => {
  const [expanded, setExpanded] = useState(false);
  const categoryColor = CATEGORY_COLORS[catalogItem?.category ?? ""] ?? "#6b7280";

  return (
    <View className="bg-white border border-gray-200 rounded-xl mb-2 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center p-3">
        {/* Numéro + indicateur de catégorie */}
        <View
          className="w-8 h-8 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: categoryColor }}
        >
          <Text className="text-white font-bold text-xs">{index + 1}</Text>
        </View>

        {/* Info couche */}
        <TouchableOpacity
          className="flex-1"
          onPress={() => setExpanded((prev) => !prev)}
          activeOpacity={0.7}
        >
          <Text className="font-semibold text-gray-800">
            {catalogItem?.label ?? layer.type}
          </Text>
          <Text className="text-xs text-gray-500">
            {catalogItem?.category ?? ""}
            {Object.keys(layer.params).length > 0 &&
              ` · ${Object.entries(layer.params)
                .map(([k, v]) => `${k}=${v}`)
                .join(", ")}`}
          </Text>
        </TouchableOpacity>

        {/* Boutons déplacement */}
        <View className="flex-row items-center gap-1">
          <TouchableOpacity
            onPress={() => onMoveUp(index)}
            disabled={index === 0}
            className={`p-1.5 rounded ${index === 0 ? "opacity-30" : ""}`}
          >
            <MaterialIcons name="arrow-upward" size={18} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onMoveDown(index)}
            disabled={index >= totalLayers - 1}
            className={`p-1.5 rounded ${index >= totalLayers - 1 ? "opacity-30" : ""}`}
          >
            <MaterialIcons name="arrow-downward" size={18} color="#6b7280" />
          </TouchableOpacity>

          {/* Expand / Collapse */}
          <TouchableOpacity
            onPress={() => setExpanded((prev) => !prev)}
            className="p-1.5 rounded"
          >
            <MaterialIcons
              name={expanded ? "expand-less" : "expand-more"}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>

          {/* Supprimer */}
          <TouchableOpacity
            onPress={() => onRemove(layer.id)}
            className="p-1.5 rounded"
          >
            <MaterialIcons name="close" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Paramètres (expanded) */}
      {expanded && catalogItem && Object.keys(catalogItem.params).length > 0 && (
        <View className="px-3 pb-3 pt-1 border-t border-gray-100">
          {Object.entries(catalogItem.params).map(([paramKey, paramDef]) => (
            <View key={paramKey} className="flex-row items-center justify-between mb-2">
              <View className="flex-1 mr-3">
                <Text className="text-sm font-medium text-gray-700">{paramKey}</Text>
                <Text className="text-xs text-gray-400">{paramDef.description}</Text>
              </View>
              <TextInput
                value={String(layer.params[paramKey] ?? paramDef.default)}
                onChangeText={(v) => {
                  const num = paramDef.type === "float" ? parseFloat(v) : parseInt(v, 10);
                  if (!isNaN(num)) {
                    onUpdateParam(layer.id, paramKey, num);
                  }
                }}
                keyboardType={paramDef.type === "float" ? "decimal-pad" : "numeric"}
                className="bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 w-24 text-right text-sm"
              />
            </View>
          ))}
        </View>
      )}

      {/* Message si pas de paramètres */}
      {expanded && catalogItem && Object.keys(catalogItem.params).length === 0 && (
        <View className="px-3 pb-3 pt-1 border-t border-gray-100">
          <Text className="text-xs text-gray-400 italic">
            Aucun paramètre configurable
          </Text>
        </View>
      )}
    </View>
  );
};

export default CustomLayerCard;
