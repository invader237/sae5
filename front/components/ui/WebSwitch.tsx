import React from "react";
import { TouchableOpacity, View, StyleSheet, GestureResponderEvent } from "react-native";
import { Colors, BorderRadius } from "@/constants/theme";

type Props = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  trackColor?: { false: string; true: string };
  thumbColor?: string;
};

export default function WebSwitch({
  value,
  onValueChange,
  disabled = false,
  trackColor,
  thumbColor,
}: Props) {
  const trackBg = value ? (trackColor?.true ?? Colors.primary) : (trackColor?.false ?? Colors.border);
  const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return;
    onValueChange(!value);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={[styles.container, { backgroundColor: trackBg, opacity: disabled ? 0.6 : 1 }]}
    >
      <View
        style={[
          styles.thumb,
          {
            backgroundColor: thumbColor ?? Colors.white,
            transform: [{ translateX: value ? 16 : 0 }],
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 26,
    borderRadius: BorderRadius.full,
    padding: 3,
    justifyContent: "center",
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 20,
  },
});
