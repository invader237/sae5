import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { styles } from '@/assets/styles/Tabs.styles';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

type IconName = React.ComponentProps<typeof IconSymbol>['name'];

function TabIcon({ name, color }: { name: IconName; color: string }) {
  return (
    <View style={styles.iconWrap}>
      <IconSymbol name={name} size={30} color={color} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <BlurView intensity={40} tint="dark" style={{ flex: 1 }} />,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color }) => <TabIcon name="clock.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Caméra',
          tabBarIcon: ({ color }) => <TabIcon name="camera" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <TabIcon name="person.crop.circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
