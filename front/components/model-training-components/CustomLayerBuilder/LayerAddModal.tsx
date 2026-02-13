import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { LayerCatalogItem } from "@/api/DTO/layerCatalog.dto";

type Props = {
  visible: boolean;
  onClose: () => void;
  catalogByCategory: Record<string, LayerCatalogItem[]>;
  categories: string[];
  onSelectLayer: (item: LayerCatalogItem) => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  convolution: "Convolution",
  pooling: "Pooling",
  linear: "Couches linéaires",
  activation: "Activation",
  regularization: "Régularisation",
  normalization: "Normalisation",
  utility: "Utilitaires",
};

const CATEGORY_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  convolution: "grid-on",
  pooling: "compress",
  linear: "linear-scale",
  activation: "flash-on",
  regularization: "shield",
  normalization: "tune",
  utility: "build",
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

const LayerAddModal: React.FC<Props> = ({
  visible,
  onClose,
  catalogByCategory,
  categories,
  onSelectLayer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelect = (item: LayerCatalogItem) => {
    onSelectLayer(item);
    onClose();
    setSelectedCategory(null);
  };

  const handleClose = () => {
    onClose();
    setSelectedCategory(null);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-white rounded-2xl w-full max-w-lg max-h-[80%] overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              {selectedCategory && (
                <TouchableOpacity onPress={() => setSelectedCategory(null)} className="mr-2">
                  <MaterialIcons name="arrow-back" size={22} color="#333" />
                </TouchableOpacity>
              )}
              <Text className="text-lg font-bold text-gray-800">
                {selectedCategory
                  ? CATEGORY_LABELS[selectedCategory] ?? selectedCategory
                  : "Ajouter une couche"}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4">
            {/* Vue catégories */}
            {!selectedCategory &&
              categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className="flex-row items-center p-3 mb-2 bg-gray-50 rounded-xl border border-gray-200"
                  activeOpacity={0.7}
                >
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                    style={{ backgroundColor: CATEGORY_COLORS[category] ?? "#6b7280" }}
                  >
                    <MaterialIcons
                      name={CATEGORY_ICONS[category] ?? "layers"}
                      size={20}
                      color="white"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800">
                      {CATEGORY_LABELS[category] ?? category}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {catalogByCategory[category]?.length ?? 0} couche(s)
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={22} color="#9ca3af" />
                </TouchableOpacity>
              ))}

            {/* Vue couches d'une catégorie */}
            {selectedCategory &&
              (catalogByCategory[selectedCategory] ?? []).map((item) => (
                <TouchableOpacity
                  key={item.type}
                  onPress={() => handleSelect(item)}
                  className="p-3 mb-2 bg-gray-50 rounded-xl border border-gray-200"
                  activeOpacity={0.7}
                >
                  <Text className="font-semibold text-gray-800">{item.label}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{item.description}</Text>
                  {Object.keys(item.params).length > 0 && (
                    <Text className="text-xs text-gray-400 mt-1">
                      Paramètres :{" "}
                      {Object.entries(item.params)
                        .map(([key, def]) => `${key}=${def.default}`)
                        .join(", ")}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default LayerAddModal;
