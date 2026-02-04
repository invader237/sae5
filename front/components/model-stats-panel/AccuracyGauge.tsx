import React, { memo } from "react";
import { View, Text } from "react-native";
import { Colors, BorderRadius } from "@/constants/theme";

interface AccuracyGaugeProps {
  value: number;
}

const AccuracyGauge = memo(function AccuracyGauge({
  value,
}: AccuracyGaugeProps) {
  const percentage = (value * 100).toFixed(1);
  const tone =
    value >= 0.8
      ? { text: Colors.success, bg: Colors.successLight, border: Colors.success }
      : value >= 0.5
      ? { text: Colors.warning, bg: Colors.warningLight, border: Colors.warning }
      : { text: Colors.danger, bg: Colors.dangerLight, border: Colors.danger };

  return (
    <View
      className="p-4 items-center"
      style={{
        backgroundColor: tone.bg,
        borderWidth: 1,
        borderColor: tone.border,
        borderRadius: BorderRadius.lg,
      }}
    >
      <Text className="text-4xl font-bold" style={{ color: tone.text }}>
        {percentage}%
      </Text>
      <Text className="text-sm mt-1" style={{ color: Colors.textSecondary }}>
        Précision globale
      </Text>
      <Text className="text-xs mt-2" style={{ color: Colors.textMuted }}>
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
