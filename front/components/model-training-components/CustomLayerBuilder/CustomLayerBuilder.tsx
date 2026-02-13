import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CustomLayerCard from "./CustomLayerCard";
import LayerAddModal from "./LayerAddModal";
import type { useCustomLayers } from "@/hooks/models/useCustomLayers";

type Props = {
  customLayers: ReturnType<typeof useCustomLayers>;
};

const CustomLayerBuilder: React.FC<Props> = ({ customLayers }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const {
    catalog,
    catalogByCategory,
    categories,
    configuredLayers,
    isLoadingCatalog,
    addLayer,
    removeLayer,
    updateLayerParam,
    moveLayerUp,
    moveLayerDown,
    clearLayers,
  } = customLayers;

  // Trouver l'item du catalogue correspondant à un type
  const findCatalogItem = (type: string) =>
    catalog.find((item) => item.type === type);

  return (
    <View>
      <View className="bg-gray-100 p-3 rounded-xl">
        {/* Liste des couches configurées */}
        {configuredLayers.length === 0 ? (
          <View className="py-6 items-center">
            <MaterialIcons name="layers-clear" size={36} color="#9ca3af" />
            <Text className="text-gray-400 mt-2 text-sm text-center">
              Aucune couche ajoutée.{"\n"}Appuyez sur le bouton ci-dessous pour commencer.
            </Text>
          </View>
        ) : (
          <View>
            {configuredLayers.map((layer, index) => (
              <CustomLayerCard
                key={layer.id}
                layer={layer}
                index={index}
                totalLayers={configuredLayers.length}
                catalogItem={findCatalogItem(layer.type)}
                onRemove={removeLayer}
                onUpdateParam={updateLayerParam}
                onMoveUp={moveLayerUp}
                onMoveDown={moveLayerDown}
              />
            ))}
          </View>
        )}

        {/* Boutons d'action */}
        <View className="flex-row gap-2 mt-2">
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            disabled={isLoadingCatalog}
            className="flex-1 flex-row items-center justify-center bg-[#007bff] rounded-lg py-2.5 px-3"
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-1.5">
              Ajouter une couche
            </Text>
          </TouchableOpacity>

          {configuredLayers.length > 0 && (
            <TouchableOpacity
              onPress={clearLayers}
              className="flex-row items-center justify-center bg-gray-200 rounded-lg py-2.5 px-3"
              activeOpacity={0.8}
            >
              <MaterialIcons name="delete-outline" size={20} color="#6b7280" />
              <Text className="text-gray-600 font-medium ml-1">Vider</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modal d'ajout */}
      <LayerAddModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        catalogByCategory={catalogByCategory}
        categories={categories}
        onSelectLayer={addLayer}
      />
    </View>
  );
};

export default CustomLayerBuilder;
