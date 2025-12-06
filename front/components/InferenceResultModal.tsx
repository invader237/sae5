import React, { useState } from 'react';
import { Modal, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Spinner from '@/components/Spinner';
import { InferenceResult } from '@/api/DTO/inference.dto';
import { Colors } from '@/constants/theme';

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
  const [showMore, setShowMore] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatScore = (score: number) => `${(score * 100).toFixed(1)}%`;

  const showingResults = !!inferenceResult && !isLoading;
  const topPrediction = showingResults
    ? inferenceResult.top_prediction || inferenceResult.predictions[0]
    : null;
  const otherPredictions = showingResults
    ? inferenceResult.predictions.slice(1)
    : [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <ThemedView
          lightColor={Colors.light.background}
          className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80%]"
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <ThemedText type="title" className="text-lg" lightColor={Colors.light.text}>
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
                <ThemedText className="text-sm" lightColor={Colors.text}>
                  Modèle: {inferenceResult.model_version}
                </ThemedText>
                <ThemedText className="text-sm" lightColor={Colors.text}>
                  Temps: {inferenceResult.time_ms.toFixed(0)}ms
                </ThemedText>
                <ThemedText className="text-sm" lightColor={Colors.text}>
                  Score: {((inferenceResult.top_prediction?.score ?? inferenceResult.predictions[0].score) * 100).toFixed(1)}%
                </ThemedText>
              </View>

              {/* Top prediction emphasized */}
              {topPrediction && (
                <View className="mb-6 p-4">
                  <ThemedText
                    type="title"
                    className="text-5xl text-center"
                    lightColor={Colors.light.text}
                  >
                    {topPrediction.label}
                  </ThemedText>
                </View>
              )}

              {/* Other predictions toggle */}
              {otherPredictions.length > 0 && (
                <>
                  {showMore && (
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <ThemedText type="subtitle" className="mb-3" lightColor={Colors.light.text}>
                        Autres prédictions
                      </ThemedText>

                      {otherPredictions.map((pred, index) => (
                        <View key={index} className="mb-3">
                          <View className="flex-row justify-between items-center mb-1">
                            <ThemedText className="font-medium" lightColor={Colors.text}>{pred.label}</ThemedText>
                            <ThemedText className="text-sm" lightColor={Colors.text}>{formatScore(pred.score)}</ThemedText>
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
                  )}

                  <TouchableOpacity
                    className="mt-2 mb-3 py-3 px-3 rounded-lg border border-gray-200"
                    onPress={() => setShowMore((v) => !v)}
                  >
                    <ThemedText className="text-center font-semibold" lightColor={Colors.primary}>
                      {showMore ? 'Masquer les autres résultats' : 'Voir plus de résultats'}
                    </ThemedText>
                  </TouchableOpacity>
                </>
              )}

              {/* Footer */}
              <View className="mt-2">
                <TouchableOpacity onPress={onClose} style={{ backgroundColor: Colors.primary }} className="py-3 rounded-lg">
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