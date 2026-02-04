import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import "../global.css";
import { View, Platform, StyleSheet, useWindowDimensions } from "react-native";
import { Colors } from "@/constants/theme";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const { width } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Force un re-render après le montage pour s'assurer que les dimensions sont correctes
    setMounted(true);
  }, []);

  const isCardStyle = Platform.OS === "web" && width >= 430 && mounted;

  return (
    <AuthProvider>
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: Colors.background,
        }}
      />
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
    backgroundColor: Colors.background,
  },
  card: {
    maxWidth: 430,
    marginHorizontal: "auto",
    borderRadius: 22,
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.30)",
  },
});
