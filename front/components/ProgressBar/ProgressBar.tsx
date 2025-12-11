import React from "react";
import { View } from "react-native";

type Props = {
  value: number;
  threshold: number;
  width?: number | string;
};

const ProgressBar = ({ value, threshold, width = 96 }: Props) => {
  // Clamp du pourcentage
  const percent = Math.min(Math.max(value, 0), 100);

  // Détermine la couleur selon le seuil
  const color = percent < threshold ? "#ef4444" : "#22c55e"; 
  // rouge 500 / vert 500

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
