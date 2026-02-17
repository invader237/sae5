import { Tabs } from "expo-router";
import React from "react";
import { View, Pressable } from "react-native";
import "../../global.css";
import { useAuth } from "@/hooks/auth/useAuth";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";
import { Camera, History, Shield, User } from "lucide-react-native";

type TabIconProps = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
};

function TabIcon({ icon: Icon, color }: TabIconProps) {
  const ICON_SIZE = 22;

  return (
    <View
      className="items-center justify-center"
      style={{ padding: 0, height: "100%", justifyContent: "center", alignItems: "center" }}
    >
      <Icon size={ICON_SIZE} color={color} />
    </View>
  );
}

function CenterTabButton({ children, onPress }: { children: React.ReactNode; onPress?: (event: any) => void }) {
  return (
    <Pressable
      onPress={(event) => onPress?.(event)}
      className="items-center justify-center"
      style={{
        width: 80,
        height: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary,
        ...Shadows.lg,
      }}
    >
      {children}
    </Pressable>
  );
}

export default function TabLayout() {
  const { isAdmin } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarShowLabel: true,
        tabBarStyle: {
          minHeight: 72,
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          position: "relative",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2,
          marginBottom: 6,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
        tabBarBackground: () => (
          <View 
            style={{ 
              flex: 1, 
              backgroundColor: Colors.white,
            }} 
          />
        ),
        tabBarItemStyle: {
          paddingTop: 0,
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <Tabs.Screen
        name="history"
        options={{
          title: "Historique",
          tabBarIcon: ({ color }) => <TabIcon icon={History} color={color} />,
        }}
      />
      <Tabs.Screen
name="index"
        options={{
          title: "Caméra",
          tabBarIcon: ({ color }) => <TabIcon icon={Camera} color={color} />,
        }}
      />

            <Tabs.Screen
        name="admin-panel"
        options={{
          href: isAdmin ? "/admin-panel" : null,
          title: "Admin",
          tabBarIcon: ({ color }) => <TabIcon icon={Shield} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <TabIcon icon={User} color={color} />,
        }}
      />

    </Tabs>
  );
}
