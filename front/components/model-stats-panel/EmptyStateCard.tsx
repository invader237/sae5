import React, { memo } from "react";
import { View, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";

interface EmptyStateCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
}

const EmptyStateCard = memo(function EmptyStateCard({
  icon,
  title,
  description,
}: EmptyStateCardProps) {
  return (
    <View
      className="p-6 items-center"
      style={{
        backgroundColor: Colors.inputBackground,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
      }}
    >
      <MaterialIcons name={icon} size={40} color={Colors.textMuted} />
      <Text className="text-base font-semibold mt-3" style={{ color: Colors.text }}>
        {title}
      </Text>
      <Text className="text-sm text-center mt-1" style={{ color: Colors.textSecondary }}>
        {description}
      </Text>
    </View>
  );
});

export default EmptyStateCard;
