import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import "../global.css";
import { View, Platform, StyleSheet, useWindowDimensions } from "react-native";

export default function RootLayout() {
  const { width } = useWindowDimensions();

  const isCardStyle = Platform.OS === "web" && width > 430;

  return (
    <AuthProvider>
      <View className="absolute inset-0 bg-gradient-to-b from-gray-300 via-white to-white" />
      <View style={[styles.container, isCardStyle && styles.card]}>
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
    width: "100%",
    backgroundColor: "#fff",
  },
  card: {
    maxWidth: 430,
    marginHorizontal: "auto",
    borderRadius: 22,
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.30)",
  },
});
