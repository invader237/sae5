import React from 'react';
import { View, ActivityIndicator, type ActivityIndicatorProps } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { Activity as LucideActivity } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

type SpinnerProps = ActivityIndicatorProps & {
  overlay?: boolean;
};

export function Spinner({ overlay = false, color, size = 'small', ...props }: SpinnerProps) {
  const defaultColor = color ?? Colors.primary;

  if (overlay) {
    return (
      <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedView style={{ backgroundColor: 'rgba(255,255,255,0.8)', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }} />
        <LucideActivity color={defaultColor} size={48} />
      </View>
    );
  }

  return <ActivityIndicator color={defaultColor} size={size} {...props} />;
}

export default Spinner;
