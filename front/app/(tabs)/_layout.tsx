import { IconSymbol } from "@/components/ui/icon-symbol";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import "../../global.css";
import { useAuth } from "@/hooks/auth/useAuth";

type IconName = React.ComponentProps<typeof IconSymbol>["name"];

function TabIcon({ name, color }: { name: IconName; color: string }) {
  return (
    <View className="items-center justify-center">
      <IconSymbol name={name} size={28} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const { isPrivileged } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0A84FF",
        tabBarInactiveTintColor: "rgba(255,255,255,0.65)",
        tabBarStyle: {
          height: 85,
          backgroundColor: "rgba(0,0,0,0.2)",
          borderTopWidth: 0,
          position: "absolute",
        },
        tabBarBackground: () => (
          <BlurView intensity={40} tint="dark" style={{ flex: 1 }} />
        ),
        tabBarLabelStyle: { fontSize: 13, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="history"
        options={{
          title: "Historique",
          tabBarIcon: ({ color }) => (
            <TabIcon name="clock.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Caméra",
          tabBarIcon: ({ color }) => (
            <TabIcon name="camera.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <TabIcon name="person.crop.circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin-panel"
        options={{
          href: isPrivileged ? "/admin-panel" : null,
          title: "Admin",
          tabBarIcon: ({ color }) => (
            <TabIcon name="shield.lefthalf.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
