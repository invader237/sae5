import React, { memo } from "react";
import { View, Text } from "react-native";

interface AccuracyGaugeProps {
  value: number;
}

const AccuracyGauge = memo(function AccuracyGauge({
  value,
}: AccuracyGaugeProps) {
  const percentage = (value * 100).toFixed(1);
  const color =
    value >= 0.8
      ? "text-green-600"
      : value >= 0.5
      ? "text-yellow-600"
      : "text-red-600";
  const bgColor =
    value >= 0.8
      ? "bg-green-50 border-green-200"
      : value >= 0.5
      ? "bg-yellow-50 border-yellow-200"
      : "bg-red-50 border-red-200";

  return (
    <View className={`border rounded-lg p-4 items-center ${bgColor}`}>
      <Text className={`text-4xl font-bold ${color}`}>{percentage}%</Text>
      <Text className="text-sm text-gray-600 mt-1">Précision globale</Text>
      <Text className="text-xs text-gray-400 mt-2">
        {value >= 0.8
          ? "Excellente performance"
          : value >= 0.5
          ? "Performance acceptable"
          : "Performance à améliorer"}
      </Text>
    </View>
  );
});

export default AccuracyGauge;
