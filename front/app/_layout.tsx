import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import "../global.css";
import { View, Platform, StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
    <View className="absolute inset-0 bg-gradient-to-b from-gray-300 via-white to-white" />
      <View style={styles.container}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </View>
    <View />
    </AuthProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === "web"
      ? {
          maxWidth: 390,
          width: "100%",
          marginHorizontal: "auto",
          backgroundColor: "#fff",
          boxShadow: "0 20px 40px rgba(0,0,0,0.30)",
          borderRadius: 22,
          overflow: "hidden",
        }
      : {}),
  },
});
