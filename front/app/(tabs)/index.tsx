import { Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-[28px] font-extrabold text-[#007bff]">
        Reconnaissance de salles
      </Text>

      <Text className="text-[#555] text-base mt-2 mb-6 text-center">
        IUT de Metz
      </Text>

      <TouchableOpacity className="bg-[#007bff] min-w-[150px] h-12 px-10 mb-5 rounded-xl items-center justify-center">
        <Text className="text-white text-lg font-semibold">Caméra</Text>
      </TouchableOpacity>

      <TouchableOpacity className="bg-[#007bff] min-w-[150px] h-12 px-10 rounded-xl items-center justify-center">
        <Text className="text-white text-lg font-semibold">Importer</Text>
      </TouchableOpacity>
    </View>
  );
}
