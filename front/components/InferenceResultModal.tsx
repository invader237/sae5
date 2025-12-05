import React from 'react';
import { Modal, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Spinner from '@/components/Spinner';
import { InferenceResult } from '@/api/DTO/inference.dto';

interface InferenceResultModalProps {
  visible: boolean;
  onClose: () => void;
  inferenceResult: InferenceResult | null;
  isLoading?: boolean;
}

export function InferenceResultModal({
  visible,
  onClose,
  inferenceResult,
  isLoading = false,
}: InferenceResultModalProps) {

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatScore = (score: number) => `${(score * 100).toFixed(1)}%`;

  const showingResults = !!inferenceResult && !isLoading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <ThemedView className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80%]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <ThemedText type="title" className="text-lg">
              Résultat d'analyse
            </ThemedText>
          </View>

          {/* Loading state: show spinner and a small message */}
          {isLoading || !inferenceResult ? (
            <View className="flex-1 items-center justify-center py-8">
              <Spinner />
              <ThemedText className="mt-3 text-gray-600">Analyse en cours…</ThemedText>
            </View>
          ) : (
            <>
              {/* Model Info */}
              <View className="mb-4">
                <ThemedText className="text-sm text-gray-600">
                  Modèle: {inferenceResult.model_version}
                </ThemedText>
                <ThemedText className="text-sm text-gray-600">
                  Temps: {inferenceResult.time_ms.toFixed(0)}ms
                </ThemedText>
              </View>

              {/* Predictions */}
              <ScrollView showsVerticalScrollIndicator={false}>
                <ThemedText type="subtitle" className="mb-3">
                  Prédictions ({inferenceResult.predictions.length})
                </ThemedText>

                {inferenceResult.predictions.map((pred, index) => (
                  <View key={index} className="mb-3">
                    <View className="flex-row justify-between items-center mb-1">
                      <ThemedText className="font-medium">{pred.label}</ThemedText>
                      <ThemedText className="text-sm">{formatScore(pred.score)}</ThemedText>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View
                        className={`h-full ${getScoreColor(pred.score)}`}
                        style={{ width: `${pred.score * 100}%` }}
                      />
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Footer */}
              <View className="mt-4 pt-4 border-t border-gray-200">
                <TouchableOpacity onPress={onClose} className="bg-blue-500 py-3 rounded-lg">
                  <ThemedText className="text-white text-center font-semibold">Fermer</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}