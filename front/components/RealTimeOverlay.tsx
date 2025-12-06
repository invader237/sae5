import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { InferenceResult } from '@/api/DTO/inference.dto';

interface RealTimeOverlayProps {
  inferenceResult?: InferenceResult | null;
  isAnalyzing?: boolean;
}

export function RealTimeOverlay({ inferenceResult, isAnalyzing }: RealTimeOverlayProps) {
  const topPrediction = inferenceResult?.top_prediction || inferenceResult?.predictions?.[0];

  if (!topPrediction) return null;

  return (
    <View className="absolute inset-0 pointer-events-none" pointerEvents="none">
      {/* Top-left: Label */}
      <View className="absolute top-4 left-4 bg-black/70 rounded-lg px-3 py-2">
        <ThemedText className="text-2xl font-bold" lightColor="#000">
          {topPrediction.label}
        </ThemedText>
      </View>

      {/* Top-right: Percentage */}
      <View className="absolute top-4 right-4 bg-black/70 rounded-lg px-3 py-2">
        <ThemedText className="text-2xl font-bold" lightColor="#000">
          {(topPrediction.score * 100).toFixed(1)}%
        </ThemedText>
      </View>
    </View>
  );
}