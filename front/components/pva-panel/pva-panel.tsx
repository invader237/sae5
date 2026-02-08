import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import PvaModal from "@/components/pva-components/PvaModal";
import PictureItem from "@/components/pva-components/PvaPictureItem";
import { usePvaPreview } from "@/hooks/pva/usePvaPreview";
import { usePvaStatus } from "@/hooks/pva/usePvaStatus";

interface PvaPanelProps {
  onDataChanged?: () => void;
}

const PvaPanel = ({ onDataChanged }: PvaPanelProps) => {
  const [pvaModalIsVisible, setPvaModalIsVisible] = useState(false);
  const { pvaEnabled, pendingCount, refresh: refreshStatus } = usePvaStatus();
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
      refreshStatus();
      onDataChanged?.();
    },
    [handleValidated, refreshStatus, onDataChanged]
  );

  const handleDeletedWithRefresh = useCallback(
    (ids: string[]) => {
      handleDeleted(ids);
      refreshStatus();
      onDataChanged?.();
    },
    [handleDeleted, refreshStatus, onDataChanged]
  );

  const handleUpdatedWithRefresh = useCallback(() => {
    refreshStatus();
    onDataChanged?.();
  }, [refreshStatus, onDataChanged]);

  const handleRefresh = async () => {
    try {
      await refresh();
      await refreshStatus();
    } catch {
      alert("Impossible de récupérer les images. Veuillez réessayer plus tard.");
    }
  };

  if (!pvaEnabled) {
    return (
      <View className="bg-white p-4 border border-gray-300 rounded-lg gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-[#333] text-lg font-bold">Pré-validation</Text>
          <View className="bg-gray-200 rounded-full px-3 py-1">
            <Text className="text-gray-500 text-xs font-semibold">Désactivée</Text>
          </View>
        </View>
        <Text className="text-gray-400 text-sm">
          La pré-validation admin est désactivée. Les images envoyées ne sont pas enregistrées.
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white p-4 border border-gray-300 rounded-lg gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-[#333] text-lg font-bold">Pré-validation</Text>
          {pendingCount > 0 && (
            <View className="bg-red-500 rounded-full min-w-[24px] h-6 items-center justify-center px-1.5">
              <Text className="text-white text-xs font-bold">{pendingCount}</Text>
            </View>
          )}
        </View>
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
