import { View, Text, ScrollView } from "react-native";
import { useCallback, useState } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { Redirect } from "expo-router";
import ModelSelector from "@/components/model-selector";
import ModelStatsPanel from "@/components/model-stats-panel";
import PvaPanel from "@/components/pva-panel";
import RoomManagmentPanel from "@/components/room-managment-panel";
import ModelTrainingPanel from "@/components/model-training-panel";
import { useModelSelector } from "@/hooks/models/useModelSelector";
import { Colors } from "@/constants/theme";

export default function AdminPanel() {
  const { isAdmin, isLoading } = useAuth();
  const modelSelector = useModelSelector();
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);

  const triggerStatsRefresh = useCallback(() => {
    setStatsRefreshKey((prev) => prev + 1);
  }, []);

  // Protection supplémentaire : redirige si pas admin
  if (!isLoading && !isAdmin) {
    return <Redirect href="/" />;
  }

  return (
    <ScrollView 
      className="flex-1" 
      style={{ backgroundColor: Colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
    >
      <View className="gap-5">
        {/* Header avec style moderne */}
        <View className="mb-2">
          <Text 
            className="text-3xl font-bold"
            style={{ color: Colors.text }}
          >
            Panneau Admin
          </Text>
        </View>

      <ModelSelector controller={modelSelector} />

      <ModelStatsPanel
        modelId={modelSelector.model}
        refreshKey={statsRefreshKey}
      />

      <PvaPanel onDataChanged={triggerStatsRefresh} />

        <RoomManagmentPanel />

        <ModelTrainingPanel />
      </View>
    </ScrollView>
  );
}
