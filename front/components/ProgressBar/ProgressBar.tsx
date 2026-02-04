import React from "react";
import { View } from "react-native";
import { Colors, BorderRadius } from "@/constants/theme";

type Props = {
  value: number;
  threshold: number;
  max: number;
  width?: number | string;
};

const ProgressBar = ({ value, threshold, max, width = 96 }: Props) => {
  const safeMax = Math.max(1, max);
  const clampedValue = Math.min(Math.max(value ?? 0, 0), safeMax);
  const percent = (clampedValue / safeMax) * 100;

  const clampedThreshold = Math.min(Math.max(threshold, 0), 100);

  const color = percent >= clampedThreshold ? Colors.primary : Colors.danger;

  return (
    <View
      style={{ 
        width, 
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: BorderRadius.full,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${percent}%`,
          backgroundColor: color,
          borderRadius: BorderRadius.full,
        }}
      />
    </View>
  );
};

export default ProgressBar;
