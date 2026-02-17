import React, { useMemo, useState, useEffect } from "react";
import { Image, Pressable, } from "react-native";
import axiosInstance, { baseURL } from "@/api/axiosConfig";

import { Modal, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spinner } from '@/components/Spinner';
import { InferenceResultDTO } from '@/api/DTO/inference.dto';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';

type ActivationItem = {
  layer: string;
  url: string;
  type?: "heatmap" | "overlay";
  shape?: number[];
};

type UiActivation = {
  name: string; // label affiché
  url: string; // url relative API
  type?: "heatmap" | "overlay";
  shape?: number[];
};

interface InferenceResultModalProps {
  visible: boolean;
  onClose: () => void;
  inferenceResult: InferenceResultDTO | null;
  isLoading?: boolean;
}

export function InferenceResultModal({
  visible,
  onClose,
  inferenceResult,
  isLoading = false,
}: InferenceResultModalProps) {
  const [showMore, setShowMore] = useState(false);
  const [showActivations, setShowActivations] = useState(false);
  const [showHeatmaps, setShowHeatmaps] = useState(false);

  const [activations, setActivations] = useState<UiActivation[]>([]);
  const [activationsLoading, setActivationsLoading] = useState(false);

  const [selected, setSelected] = useState<UiActivation | null>(null);

  useEffect(() => {
    if (!visible) {
      setShowMore(false);
      setShowActivations(false);
      setShowHeatmaps(false);
      setActivations([]);
      setActivationsLoading(false);
      setSelected(null);
    }
  }, [visible]);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return Colors.success;
    if (score >= 0.6) return Colors.warning;
    return Colors.danger;
  };

  const formatScore = (score: number) => `${(score * 100).toFixed(1)}%`;

  const showingResults = !!inferenceResult && !isLoading;

  const topPrediction = useMemo(() => {
    if (!showingResults) return null;
    return (
      inferenceResult!.top_prediction ||
      inferenceResult!.predictions?.[0] ||
      null
    );
  }, [showingResults, inferenceResult]);

  const otherPredictions = useMemo(() => {
    if (!showingResults) return [];
    return (inferenceResult!.predictions || []).slice(1);
  }, [showingResults, inferenceResult]);

  const hasActivations = useMemo(() => {
    if (!inferenceResult) return false;

    const items = (inferenceResult as any)?.activations?.items;
    if (Array.isArray(items) && items.length > 0) return true;

    if ((inferenceResult as any)?.activation_token) return true;
    if (
      Array.isArray((inferenceResult as any)?.activation_image_urls) &&
      (inferenceResult as any).activation_image_urls.length > 0
    ) {
      return true;
    }

    return false;
  }, [inferenceResult]);

  const normalizeActivations = (res: any): UiActivation[] => {
    if (!res) return [];

    const items: ActivationItem[] = res?.activations?.items;
    if (Array.isArray(items) && items.length > 0) {
      return items
        .filter((it) => typeof it?.url === "string")
        .map((it) => ({
          name: String(it.layer ?? "layer"),
          url: String(it.url),
          type: it.type,
          shape: Array.isArray(it.shape) ? it.shape : undefined,
        }));
    }

    const urls = res?.activation_image_urls;
    if (Array.isArray(urls) && urls.length > 0) {
      return urls
        .filter((u: any) => typeof u === "string")
        .map((u: string) => {
          const name = u.split("/").pop()?.replace(".png", "") ?? "layer";
          return { name, url: u };
        });
    }

    const images = res?.images;
    if (Array.isArray(images) && images.length > 0) {
      return images
        .filter((x: any) => typeof x?.url === "string")
        .map((x: any) => ({
          name: String(x.name ?? "layer"),
          url: String(x.url),
        }));
    }

    return [];
  };

  const loadActivations = async () => {
    if (!inferenceResult) return;

    setActivationsLoading(true);
    try {
      const direct = normalizeActivations(inferenceResult);
      if (direct.length > 0) {
        setActivations(direct);
        return;
      }

      const token = (inferenceResult as any)?.activation_token;
      if (token) {
        const resp = await axiosInstance.get(`/pictures/activations/${token}`);
        setActivations(normalizeActivations(resp.data));
        return;
      }

      setActivations([]);
    } catch {
      setActivations([]);
    } finally {
      setActivationsLoading(false);
    }
  };

  const overlays = useMemo(() => {
    if (!activations.length) return [];
    const ovs = activations.filter((a) => a.type === "overlay");
    return ovs.length > 0 ? ovs : activations;
  }, [activations]);

  const heatmaps = useMemo(() => {
    if (!activations.length) return [];
    return activations.filter((a) => a.type === "heatmap");
  }, [activations]);

  const renderActivationStrip = (data: UiActivation[]) => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      >
        {data.map((a) => {
          const fullUri = `${baseURL}${a.url}`;
          return (
            <Pressable
              key={`${a.name}-${a.url}`}
              onPress={() => setSelected(a)}
              style={{ marginRight: 12, alignItems: "center" }}
            >
              <Image
                source={{ uri: fullUri }}
                style={{ width: 160, height: 160, borderRadius: 10 }}
              />
              <ThemedText
                className="text-xs mt-2"
                lightColor={Colors.text}
                style={{ maxWidth: 160, textAlign: "center" }}
                numberOfLines={2}
              >
                {a.name}
                {a.shape ? ` (${a.shape.join("×")})` : ""}
                {a.type ? ` • ${a.type}` : ""}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center p-4"
        style={{ backgroundColor: Colors.overlay }}
      >
        <ThemedView
          lightColor={Colors.background}
          className="p-6 w-full max-w-md max-h-[80%]"
          style={{
            backgroundColor: Colors.cardBackground,
            borderRadius: BorderRadius.lg,
            ...Shadows.md,
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <ThemedText type="title" className="text-lg" lightColor={Colors.text}>
              Résultat d&apos;analyse
            </ThemedText>
          </View>

          {/* Loading state: show spinner and a small message */}
          {isLoading || !inferenceResult ? (
            <View className="flex-1 items-center justify-center py-8">
              <Spinner />
              <ThemedText className="mt-3" lightColor={Colors.textSecondary}>
                Analyse en cours…
              </ThemedText>
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
              {topPrediction ? (
                <View className="mb-6 p-4">
                  <ThemedText
                    type="title"
                    className="text-5xl text-center"
                    lightColor={Colors.text}
                  >
                    {topPrediction.label}
                  </ThemedText>
                </View>
              ) : (
                <>
                  {showMore && (
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <ThemedText type="subtitle" className="mb-3" lightColor={Colors.text}>
                        Autres prédictions
                      </ThemedText>

                      {otherPredictions.map((pred, index) => (
                        <View key={index} className="mb-3">
                          <View className="flex-row justify-between items-center mb-1">
                            <ThemedText className="font-medium" lightColor={Colors.text}>{pred.label}</ThemedText>
                            <ThemedText className="text-sm" lightColor={Colors.text}>{formatScore(pred.score)}</ThemedText>
                          </View>

                          {/* Progress Bar */}
                          <View
                            className="h-2 rounded-full overflow-hidden"
                            style={{ backgroundColor: Colors.border }}
                          >
                            <View
                              className="h-full"
                              style={{
                                width: `${pred.score * 100}%`,
                                backgroundColor: getScoreColor(pred.score),
                              }}
                            />
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  )}

                  {/* Buttons */}
                  {otherPredictions.length > 0 && (
                    <>
                      {showMore && (
                        <View style={{ marginTop: 8 }}>
                          <ThemedText
                            type="subtitle"
                            className="mb-3"
                            lightColor={Colors.light.text}
                          >
                            Autres prédictions
                          </ThemedText>

                          {otherPredictions.map((pred, index) => (
                            <View key={index} style={{ marginBottom: 12 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  marginBottom: 6,
                                }}
                              >
                                <ThemedText
                                  className="font-medium"
                                  lightColor={Colors.text}
                                >
                                  {pred.label}
                                </ThemedText>
                                <ThemedText
                                  className="text-sm"
                                  lightColor={Colors.text}
                                >
                                  {formatScore(pred.score)}
                                </ThemedText>
                              </View>

                              <View
                                style={{
                                  height: 8,
                                  backgroundColor: "#e5e7eb",
                                  borderRadius: 999,
                                  overflow: "hidden",
                                }}
                              >
                                <View
                                  className={`h-full ${getScoreColor(
                                    pred.score,
                                  )}`}
                                  style={{ width: `${pred.score * 100}%` }}
                                />
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      <TouchableOpacity
                        style={{
                          marginTop: 10,
                          marginBottom: 10,
                          paddingVertical: 12,
                          paddingHorizontal: 12,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.25)",
                        }}
                        onPress={() => setShowMore((v) => !v)}
                      >
                        <ThemedText
                          className="text-center font-semibold"
                          lightColor={Colors.primary}
                        >
                          {showMore
                            ? "Masquer les autres résultats"
                            : "Voir plus de résultats"}
                        </ThemedText>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Activations toggle */}
                  {hasActivations && (
                    <TouchableOpacity
                      style={{
                        marginBottom: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.25)",
                      }}
                      onPress={async () => {
                        const next = !showActivations;
                        setShowActivations(next);
                        if (!next) {
                          setShowHeatmaps(false);
                        }
                        if (next && activations.length === 0) {
                          await loadActivations();
                        }
                      }}
                    >
                      <ThemedText
                        className="text-center font-semibold"
                        lightColor={Colors.primary}
                      >
                        {showActivations
                          ? "Masquer activations"
                          : "Voir activations"}
                      </ThemedText>
                    </TouchableOpacity>
                  )}

                  {/* Close */}
                  <TouchableOpacity
                    className="mt-2 mb-3 py-3 px-3 rounded-lg"
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.border,
                      borderRadius: BorderRadius.lg,
                    }}
                    onPress={() => setShowMore((v) => !v)}
                  >
                    <ThemedText className="text-white text-center font-semibold">
                      Fermer
                    </ThemedText>
                  </TouchableOpacity>

                  {/* Activations viewer */}
                  {showActivations && (
                    <View style={{ marginTop: 6 }}>
                      <ThemedText
                        type="subtitle"
                        className="mb-2"
                        lightColor={Colors.light.text}
                      >
                        Activations par couche
                      </ThemedText>

                      {activationsLoading ? (
                        <Spinner />
                      ) : overlays.length === 0 ? (
                        <ThemedText
                          className="text-sm"
                          lightColor={Colors.text}
                        >
                          Aucune activation disponible.
                        </ThemedText>
                      ) : (
                        <>
                          <ThemedText
                            className="text-xs mb-2"
                            lightColor={Colors.text}
                          >
                            Overlays
                          </ThemedText>

                          {renderActivationStrip(overlays)}

                          {/* Heatmaps */}
                          {heatmaps.length > 0 && (
                            <View style={{ marginTop: 10 }}>
                              <TouchableOpacity
                                style={{
                                  paddingVertical: 10,
                                  paddingHorizontal: 12,
                                  borderRadius: 12,
                                  borderWidth: 1,
                                  borderColor: "rgba(255,255,255,0.25)",
                                  alignSelf: "flex-start",
                                }}
                                onPress={() => setShowHeatmaps((v) => !v)}
                              >
                                <ThemedText
                                  className="font-semibold"
                                  lightColor={Colors.primary}
                                >
                                  {showHeatmaps
                                    ? "Masquer heatmaps"
                                    : "Voir heatmaps"}
                                </ThemedText>
                              </TouchableOpacity>

                              {showHeatmaps && (
                                <View style={{ marginTop: 10 }}>
                                  <ThemedText
                                    className="text-xs mb-2"
                                    lightColor={Colors.text}
                                  >
                                    Heatmaps
                                  </ThemedText>
                                  {renderActivationStrip(heatmaps)}
                                </View>
                              )}
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>

              {/* Footer */}
              <View className="mt-2">
                <TouchableOpacity
                  onPress={onClose}
                  style={{ backgroundColor: Colors.primary }}
                  className="py-3 rounded-lg"
                >
                  <ThemedText className="text-center font-semibold" style={{color: Colors.white}}>
                    Fermer
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
          </ThemedView>
        </View>
      </Modal>
  );
}
