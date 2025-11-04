import { Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-[24px] font-bold text-[#007bff] mb-2">Profil</Text>
      <Text className="text-[#555] text-center text-base">
        Connectez-vous pour voir les informations du profil.
      </Text>
      <TouchableOpacity className="mt-5 bg-[#007bff] h-12 px-5 rounded-xl items-center justify-center">
        <Text className="text-white text-lg font-semibold">Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
}
