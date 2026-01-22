import { View, Text, ScrollView } from "react-native";
import { useAuth } from "@/hooks/auth/useAuth";
import { Redirect } from "expo-router";
import ModelSelector from "@/components/model-selector";
import PvaPanel from "@/components/pva-panel";
import RoomManagmentPanel from "@/components/room-managment-panel";
import ModelTrainingPanel from "@/components/model-training-panel";

export default function AdminPanel() {
  const { isAdmin, isLoading } = useAuth();

  // Protection supplémentaire : redirige si pas admin
  if (!isLoading && !isAdmin) {
    return <Redirect href="/" />;
  }

  return (
    <ScrollView className="flex-1 bg-white p-6 gap-4">
      <View className="gap-4">
      <Text className="text-[24px] font-bold text-[#007bff] mb-4">Panneau Admin</Text>

      <ModelSelector />

      <PvaPanel />

      <RoomManagmentPanel />

      <ModelTrainingPanel />

      <View className="h-[200px]" />
      </View>
    </ScrollView>
  );
}
