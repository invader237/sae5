import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import PvaModal from "@/components/pva-components/PvaModal";
import PictureItem from "@/components/pva-components/PvaPictureItem";
import { usePvaPreview } from "@/hooks/pva/usePvaPreview";

interface PvaPanelProps {
  onDataChanged?: () => void;
}

const PvaPanel = ({ onDataChanged }: PvaPanelProps) => {
  const [pvaModalIsVisible, setPvaModalIsVisible] = useState(false);
  const {
    previewPictures,
    isRefreshing,
    refreshKey,
    refresh,
    handleValidated,
    handleDeleted,
  } = usePvaPreview({ previewCount: 5 });

  const handleValidatedWithRefresh = useCallback(
    (ids: string[]) => {
      handleValidated(ids);
      onDataChanged?.();
    },
    [handleValidated, onDataChanged]
  );

  const handleDeletedWithRefresh = useCallback(
    (ids: string[]) => {
      handleDeleted(ids);
      onDataChanged?.();
    },
    [handleDeleted, onDataChanged]
  );

  const handleUpdatedWithRefresh = useCallback(() => {
    onDataChanged?.();
  }, [onDataChanged]);

  const handleRefresh = async () => {
    try {
      await refresh();
    } catch {
      alert("Impossible de récupérer les images. Veuillez réessayer plus tard.");
    }
  };

  return (
    <View className="bg-white p-4 border border-gray-300 rounded-lg gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-[#333] text-lg font-bold">Pré-validation</Text>
        <TouchableOpacity onPress={handleRefresh} disabled={isRefreshing} className="bg-[#007bff] rounded-md flex-row items-center justify-center px-4 py-2">
          <MaterialIcons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ flexDirection: "row" }} className="px-3">
        {previewPictures.length > 0 ? previewPictures.map((pic, i) => (
          <View key={pic.id} className="mr-3">
            <PictureItem picture={pic} />
          </View>
        )) : (
          <View className="w-[150px] h-[150px] border border-gray-300 rounded-lg mr-3 flex items-center justify-center">
            <Text className="text-center">Aucune image à valider</Text>
          </View>
        )}
        <TouchableOpacity onPress={() => setPvaModalIsVisible(true)} className="w-[150px] h-[150px] flex items-center justify-center rounded-lg">
          <Text className="text-blue-500 underline">Voir plus...</Text>
        </TouchableOpacity>
      </ScrollView>

      <PvaModal
        visible={pvaModalIsVisible}
        onClose={() => setPvaModalIsVisible(false)}
        refreshKey={refreshKey}
        onValidated={handleValidatedWithRefresh}
        onDeleted={handleDeletedWithRefresh}
        onUpdated={handleUpdatedWithRefresh}
      />
    </View>
  );
};

export default PvaPanel;
