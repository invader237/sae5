import { View, Text } from "react-native";
import ModelSelector from "../../components/model-selector";
import PvaPanel from "../../components/pva-panel";

export default function AdminPanel() {
  return (
    <View className="flex-1 bg-white p-6 gap-4">
      <Text className="text-[24px] font-bold text-[#007bff]">Panneau Admin</Text>

      <ModelSelector />

      <PvaPanel />
    </View>
  );
}
