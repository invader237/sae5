import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import axiosInstance, { baseURL } from "@/api/axiosConfig";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";

type PictureOption = {
  id: string;
  label: string;
  previewUrl: string;
  thumbUrl: string;
};

type ActivationItem = {
  step?: number;
  layer: string;
  display_name?: string;
  type: "original" | "heatmap" | "overlay";
  url: string;
  shape?: number[];
  error?: string;
};

type ActivationsResponse = {
  model_version?: string;
  activations?: {
    token: string;
    layers_requested: string[];
    items: ActivationItem[];
  };
};

type StepEntry = {
  step: number;
  display_name: string;
  layer: string;
  shape?: number[];
  heatmap?: ActivationItem;
  overlay?: ActivationItem;
};

export default function ModelActivationVisualization() {
  /* ---- Pictures ---- */
  const [pictures, setPictures] = useState<PictureOption[]>([]);
  const [picturesLoading, setPicturesLoading] = useState(false);
  const [selectedPictureId, setSelectedPictureId] = useState<string>("");
  const [pictureModalOpen, setPictureModalOpen] = useState(false);

  /* ---- Options ---- */
  const [includeOverlays, setIncludeOverlays] = useState(true);
  const [includeHeatmaps, setIncludeHeatmaps] = useState(true);
  const [showHeatmaps, setShowHeatmaps] = useState(false);

  /* ---- Result ---- */
  const [result, setResult] = useState<ActivationsResponse | null>(null);
  const [generating, setGenerating] = useState(false);

  const selectedPicture = useMemo(
    () => pictures.find((p) => p.id === selectedPictureId) ?? null,
    [pictures, selectedPictureId],
  );

  /* ==== Fetch pictures (to-validate) ==== */
  const fetchPictures = async () => {
    setPicturesLoading(true);
    try {
      const resp = await axiosInstance.get("/pictures/to-validate", {
        params: { limit: 9, offset: 0 },
      });
      const list = Array.isArray(resp.data) ? resp.data : [];
      const mapped: PictureOption[] = list
        .filter((x: any) => x?.id)
        .map((x: any) => {
          const id = String(x.id);
          const roomLabel =
            x?.room?.name ?? x?.room?.label ?? x?.room ?? "Image";
          const short = id.slice(0, 8);
          return {
            id,
            label: `${roomLabel} • ${short}`,
            previewUrl: `/pictures/${id}/recover?type=full`,
            thumbUrl: `/pictures/${id}/recover?type=thumbnail`,
          };
        });
      setPictures(mapped);
      if (mapped.length > 0) {
        setSelectedPictureId((prev) => {
          if (prev && mapped.some((p) => p.id === prev)) return prev;
          return mapped[0].id;
        });
      } else {
        setSelectedPictureId("");
      }
    } finally {
      setPicturesLoading(false);
    }
  };

  useEffect(() => {
    fetchPictures();
  }, []);

  /* ==== Generate activations (all layers, step by step) ==== */
  const generate = async () => {
    if (!selectedPictureId) return;
    setGenerating(true);
    setResult(null);
    try {
      const resp = await axiosInstance.post<ActivationsResponse>(
        `/pictures/${selectedPictureId}/activations`,
        {
          layers: null,
          include_heatmaps: includeHeatmaps,
          include_overlays: includeOverlays,
        },
      );
      setResult(resp.data);
    } finally {
      setGenerating(false);
    }
  };

  /* ==== Steps grouped by step index ==== */
  const steps = useMemo<StepEntry[]>(() => {
    const items = result?.activations?.items ?? [];
    const map = new Map<number, StepEntry>();

    for (const item of items) {
      if (item.type === "original") continue;
      const step = item.step ?? 0;
      if (!map.has(step)) {
        map.set(step, {
          step,
          display_name: item.display_name || item.layer,
          layer: item.layer,
          shape: item.shape ?? undefined,
        });
      }
      const entry = map.get(step)!;
      if (item.type === "heatmap") entry.heatmap = item;
      if (item.type === "overlay") entry.overlay = item;
    }

    return Array.from(map.values()).sort((a, b) => a.step - b.step);
  }, [result]);

  const originalItem = useMemo(
    () =>
      (result?.activations?.items ?? []).find((i) => i.type === "original") ??
      null,
    [result],
  );

  /* ==== Shape label ==== */
  const shapeLabel = (shape?: number[]) => {
    if (!shape || !shape.length) return "";
    return shape.join(" × ");
  };

  /* ==== Picture selector thumbnail ==== */
  const renderThumb = ({ item }: { item: PictureOption }) => {
    const selected = item.id === selectedPictureId;
    return (
      <Pressable
        onPress={() => {
          setSelectedPictureId(item.id);
          setPictureModalOpen(false);
        }}
        style={{
          width: "32%",
          aspectRatio: 1,
          marginBottom: 10,
          borderRadius: BorderRadius.lg,
          overflow: "hidden",
          borderWidth: 2,
          borderColor: selected ? Colors.primary : "transparent",
          backgroundColor: Colors.inputBackground,
        }}
      >
        <Image
          source={`${baseURL}${item.thumbUrl}`}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="disk"
        />
      </Pressable>
    );
  };

  /* ==== UI ==== */
  return (
    <>
      <View
        className="p-5 gap-4"
        style={{
          backgroundColor: Colors.white,
          borderRadius: BorderRadius.lg,
          ...Shadows.md,
          overflow: "hidden",
        }}
      >
        {/* Header + Refresh */}
        <View className="flex-row items-center justify-between">
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text
              className="text-xl font-bold"
              style={{ color: Colors.text }}
              numberOfLines={2}
            >
              Visualisation couche par couche
            </Text>
          </View>

          <TouchableOpacity
            onPress={fetchPictures}
            className="flex-row items-center justify-center"
            style={{
              backgroundColor: Colors.primary,
              borderRadius: BorderRadius.full,
              width: 44,
              height: 44,
            }}
          >
            <MaterialIcons name="refresh" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Image selector */}
        <View className="gap-2">
          <Text style={{ color: Colors.text, fontWeight: "700" }}>Image</Text>

          <TouchableOpacity
            onPress={() => setPictureModalOpen(true)}
            style={{
              backgroundColor: Colors.inputBackground,
              borderRadius: BorderRadius.md,
              borderWidth: 1,
              borderColor: Colors.border,
              paddingVertical: 12,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                flex: 1,
              }}
            >
              {selectedPicture ? (
                <Image
                  source={`${baseURL}${selectedPicture.thumbUrl}`}
                  style={{ width: 44, height: 44, borderRadius: 12 }}
                  cachePolicy="disk"
                />
              ) : (
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: Colors.white,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons
                    name="image"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </View>
              )}

              <Text
                style={{ color: Colors.text, fontWeight: "700", flexShrink: 1 }}
                numberOfLines={1}
              >
                {selectedPicture ? "Image sélectionnée" : "Choisir une image"}
              </Text>
            </View>

            <MaterialIcons
              name="chevron-right"
              size={24}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Toggle overlays / heatmaps */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={() => setIncludeOverlays((v) => !v)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: BorderRadius.full,
              backgroundColor: includeOverlays
                ? Colors.primary
                : Colors.inputBackground,
              borderWidth: 1,
              borderColor: includeOverlays ? Colors.primary : Colors.border,
            }}
          >
            <MaterialIcons
              name={includeOverlays ? "check-circle" : "radio-button-unchecked"}
              size={18}
              color={includeOverlays ? Colors.white : Colors.textSecondary}
            />
            <Text
              style={{
                color: includeOverlays ? Colors.white : Colors.text,
                fontWeight: "700",
              }}
            >
              Overlays
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIncludeHeatmaps((v) => !v)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: BorderRadius.full,
              backgroundColor: includeHeatmaps
                ? Colors.primary
                : Colors.inputBackground,
              borderWidth: 1,
              borderColor: includeHeatmaps ? Colors.primary : Colors.border,
            }}
          >
            <MaterialIcons
              name={includeHeatmaps ? "check-circle" : "radio-button-unchecked"}
              size={18}
              color={includeHeatmaps ? Colors.white : Colors.textSecondary}
            />
            <Text
              style={{
                color: includeHeatmaps ? Colors.white : Colors.text,
                fontWeight: "700",
              }}
            >
              Heatmaps
            </Text>
          </TouchableOpacity>
        </View>

        {/* Generate */}
        <TouchableOpacity
          onPress={generate}
          disabled={generating || !selectedPictureId}
          style={{
            backgroundColor: Colors.primary,
            borderRadius: BorderRadius.full,
            paddingVertical: 14,
            alignItems: "center",
            opacity: generating || !selectedPictureId ? 0.6 : 1,
          }}
        >
          {generating ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text
              style={{ color: Colors.white, fontWeight: "800", fontSize: 16 }}
            >
              Générer la visualisation
            </Text>
          )}
        </TouchableOpacity>

        {/* Results – step by step */}
        {result && (
          <View style={{ gap: 16 }}>
            {/* Original image */}
            {originalItem && (
              <View style={{ gap: 6 }}>
                <Text
                  style={{
                    color: Colors.text,
                    fontWeight: "800",
                    fontSize: 15,
                  }}
                >
                  Image originale
                </Text>
                <Image
                  source={`${baseURL}${originalItem.url}`}
                  style={{ width: 160, height: 160, borderRadius: 14 }}
                  cachePolicy="disk"
                />
              </View>
            )}

            {/* View toggle */}
            {steps.length > 0 && (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => setShowHeatmaps(false)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: BorderRadius.full,
                    backgroundColor: !showHeatmaps
                      ? Colors.primary
                      : Colors.inputBackground,
                    borderWidth: 1,
                    borderColor: !showHeatmaps
                      ? Colors.primary
                      : Colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: !showHeatmaps ? Colors.white : Colors.text,
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    Overlays
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowHeatmaps(true)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: BorderRadius.full,
                    backgroundColor: showHeatmaps
                      ? Colors.primary
                      : Colors.inputBackground,
                    borderWidth: 1,
                    borderColor: showHeatmaps
                      ? Colors.primary
                      : Colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: showHeatmaps ? Colors.white : Colors.text,
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    Heatmaps
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Steps carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 14, paddingRight: 4 }}
            >
              {steps.map((entry) => {
                const img = showHeatmaps ? entry.heatmap : entry.overlay;
                if (!img) return null;

                return (
                  <View
                    key={entry.step}
                    style={{
                      width: 140,
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: Colors.inputBackground,
                      borderRadius: BorderRadius.lg,
                      paddingVertical: 10,
                      paddingHorizontal: 6,
                    }}
                  >
                    <Image
                      source={`${baseURL}${img.url}`}
                      style={{ width: 120, height: 120, borderRadius: 12 }}
                      cachePolicy="disk"
                    />

                    <Text
                      style={{
                        color: Colors.text,
                        fontWeight: "800",
                        fontSize: 12,
                      }}
                    >
                      Étape {entry.step + 1}
                    </Text>
                    <Text
                      style={{
                        color: Colors.primary,
                        fontWeight: "700",
                        fontSize: 14,
                        textAlign: "center",
                      }}
                      numberOfLines={1}
                    >
                      {entry.display_name}
                    </Text>
                    {entry.shape && (
                      <Text
                        style={{
                          color: Colors.textSecondary,
                          fontSize: 10,
                        }}
                        numberOfLines={1}
                      >
                        {shapeLabel(entry.shape)}
                      </Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Picture picker modal */}
      <Modal
        visible={pictureModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPictureModalOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.xl,
              padding: 14,
              ...Shadows.lg,
              maxHeight: "70%",
              alignSelf: "center",
              width: "100%",
              maxWidth: 720,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <Text
                style={{ color: Colors.text, fontWeight: "800", fontSize: 18 }}
              >
                Choisir une image
              </Text>

              <TouchableOpacity
                onPress={() => setPictureModalOpen(false)}
                style={{
                  backgroundColor: Colors.inputBackground,
                  borderRadius: BorderRadius.full,
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
              >
                <MaterialIcons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {picturesLoading ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator />
              </View>
            ) : pictures.length === 0 ? (
              <Text style={{ color: Colors.textSecondary }}>
                Aucune image disponible.
              </Text>
            ) : (
              <FlatList
                data={pictures}
                keyExtractor={(it) => it.id}
                numColumns={3}
                columnWrapperStyle={{ justifyContent: "flex-start", gap: 12 }}
                renderItem={renderThumb}
                showsVerticalScrollIndicator={true}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
