import React from "react";
import { View } from "react-native";

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

  const color = percent >= clampedThreshold ? "#22c55e" : "#ef4444";

  return (
    <View
      style={{ width }}
      className="h-2 bg-gray-300 rounded-full overflow-hidden"
    >
      <View
        className="h-full"
        style={{
          width: `${percent}%`,
          backgroundColor: color,
        }}
      />
    </View>
  );
};

export default ProgressBar;
