import React, { memo } from "react";
import { View, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

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
    <View className="bg-gray-50 border border-gray-200 rounded-lg p-6 items-center">
      <MaterialIcons name={icon} size={40} color="#9ca3af" />
      <Text className="text-base font-semibold text-gray-700 mt-3">
        {title}
      </Text>
      <Text className="text-sm text-gray-500 text-center mt-1">
        {description}
      </Text>
    </View>
  );
});

export default EmptyStateCard;
