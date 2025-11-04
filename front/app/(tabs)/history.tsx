import { Text, View } from "react-native";

export default function HistoryScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-[24px] font-bold text-[#007bff] mb-2">
        Historique
      </Text>
      <Text className="text-[#555] text-base">
        Aucun historique pour le moment.
      </Text>
    </View>
  );
}
