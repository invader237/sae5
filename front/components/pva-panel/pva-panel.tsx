import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import PvaModal from "@/components/pva-components/PvaModal";
import PictureItem from "@/components/pva-components/PvaPictureItem";
import { usePvaPreview } from "@/hooks/pva/usePvaPreview";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";
import { usePvaStatus } from "@/hooks/pva/usePvaStatus";

interface PvaPanelProps {
  onDataChanged?: () => void;
}

const PvaPanel = ({ onDataChanged }: PvaPanelProps) => {
  const [pvaModalIsVisible, setPvaModalIsVisible] = useState(false);
  const { pvaEnabled, pendingCount, isToggling, toggle, refresh: refreshStatus } = usePvaStatus();
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

  return (
    <View 
      className="p-5 gap-4"
      style={{
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        ...Shadows.md,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View>
            <Text 
              className="text-xs font-semibold tracking-wide uppercase mb-1"
              style={{ color: Colors.textMuted }}
            >
              Validation
            </Text>
            <Text 
              className="text-xl font-bold"
              style={{ color: Colors.text }}
            >
              Pré-validation
            </Text>
          </View>
          {pendingCount > 0 && (
            <View 
              className="rounded-full min-w-[24px] h-6 items-center justify-center px-1.5"
              style={{ backgroundColor: Colors.danger }}
            >
              <Text className="text-xs font-bold" style={{ color: Colors.white }}>{pendingCount}</Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center gap-3">
          <Switch
            value={pvaEnabled}
            onValueChange={toggle}
            disabled={isToggling}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.white}
          />
          <TouchableOpacity 
            onPress={handleRefresh} 
            disabled={isRefreshing} 
            className="flex-row items-center justify-center"
            style={{
              backgroundColor: Colors.primary,
              borderRadius: BorderRadius.full,
              width: 44,
              height: 44,
              opacity: isRefreshing ? 0.6 : 1,
            }}
          >
            <MaterialIcons name="refresh" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Info when PVA disabled */}
      {!pvaEnabled && (
        <Text 
          className="text-sm"
          style={{ color: Colors.textMuted }}
        >
          La pré-validation admin est désactivée. Les images envoyées ne sont pas enregistrées.
        </Text>
      )}

      {/* Image Gallery */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: "row", paddingVertical: 4 }}
      >
        {previewPictures.length > 0 ? previewPictures.map((pic, i) => (
          <View 
            key={pic.id} 
            className="mr-3"
            style={{
              borderRadius: BorderRadius.md,
              overflow: 'hidden',
            }}
          >
            <PictureItem picture={pic} />
          </View>
        )) : (
          <View 
            className="flex items-center justify-center mr-3"
            style={{
              width: 150,
              height: 150,
              backgroundColor: Colors.inputBackground,
              borderRadius: BorderRadius.md,
            }}
          >
            <MaterialIcons name="image" size={32} color={Colors.textMuted} />
            <Text 
              className="text-center text-sm mt-2 px-3"
              style={{ color: Colors.textMuted }}
            >
              Aucune image à valider
            </Text>
          </View>
        )}
        
        {/* See more button */}
        <TouchableOpacity 
          onPress={() => setPvaModalIsVisible(true)} 
          className="flex items-center justify-center"
          style={{
            width: 150,
            height: 150,
            backgroundColor: Colors.primary,
            borderRadius: BorderRadius.md,
          }}
        >
          <MaterialIcons name="add" size={32} color={Colors.white} />
          <Text 
            className="font-semibold mt-1"
            style={{ color: Colors.white }}
          >
            Voir plus
          </Text>
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
