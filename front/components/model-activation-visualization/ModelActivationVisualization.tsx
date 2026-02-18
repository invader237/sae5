import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import axiosInstance, { baseURL } from "@/api/axiosConfig";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";

type PictureOption = {
  id: string;
  label: string;
  previewUrl: string; // full
  thumbUrl: string; // thumbnail (selector)
};

type LayerCatalogResponse = {
  model_version: string;
  layers: string[];
  recommended?: string[];
};

type ActivationItem = {
  layer: string;
  type: "original" | "heatmap" | "overlay";
  url: string;
  shape?: number[];
};

type ActivationsResponse = {
  model_version?: string;
  activations?: {
    token: string;
    layers_requested: string[];
    items: ActivationItem[];
  };
};

export default function ModelActivationVisualization() {
  // ---------------------------
  // Pictures
  // ---------------------------
  const [pictures, setPictures] = useState<PictureOption[]>([]);
  const [picturesLoading, setPicturesLoading] = useState(false);
  const [selectedPictureId, setSelectedPictureId] = useState<string>("");
  const [pictureModalOpen, setPictureModalOpen] = useState(false);

  // ---------------------------
  // Layers
  // ---------------------------
  const [availableLayers, setAvailableLayers] = useState<string[]>([]);
  const [recommendedLayers, setRecommendedLayers] = useState<string[]>([]);
  const [layersLoading, setLayersLoading] = useState(false);

  const [selectedLayers, setSelectedLayers] = useState<string[]>([
    "conv1",
    "layer2.0.conv1",
    "layer3.0.conv1",
    "layer4.2.conv3",
  ]);

  // ---------------------------
  // Options overlays/heatmaps
  // ---------------------------
  const [includeOverlays, setIncludeOverlays] = useState(true);
  const [includeHeatmaps, setIncludeHeatmaps] = useState(true);

  // ---------------------------
  // Result
  // ---------------------------
  const [result, setResult] = useState<ActivationsResponse | null>(null);
  const [generating, setGenerating] = useState(false);

  const selectedPicture = useMemo(
    () => pictures.find((p) => p.id === selectedPictureId) ?? null,
    [pictures, selectedPictureId],
  );

  // ===========================
  // Helpers UI
  // ===========================
  const toggleLayer = (layer: string) => {
    setSelectedLayers((prev) => {
      if (prev.includes(layer)) return prev.filter((x) => x !== layer);
      return [...prev, layer];
    });
  };

  const isSelected = (layer: string) => selectedLayers.includes(layer);

  const selectedLayersLabel = useMemo(() => {
    if (!selectedLayers.length) return "(aucune)";
    if (selectedLayers.length <= 8) return selectedLayers.join(", ");
    return `${selectedLayers.slice(0, 8).join(", ")} … (+${
      selectedLayers.length - 8
    })`;
  }, [selectedLayers]);

  // ===========================
  // Fetch pictures (to-validate = true)
  // ===========================
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

  const fetchLayers = async () => {
    setLayersLoading(true);
    try {
      const resp = await axiosInstance.get<LayerCatalogResponse>(
        "/models/active/layers",
      );

      const layers = Array.isArray(resp.data?.layers) ? resp.data.layers : [];
      const clean = layers.filter((x) => typeof x === "string" && x.trim());

      setAvailableLayers(clean);

      const rec = Array.isArray(resp.data?.recommended)
        ? resp.data.recommended
        : [];
      setRecommendedLayers(rec);

      if (!selectedLayers.length) {
        const preset = (rec.length ? rec : clean.slice(0, 8)).slice(0, 8);
        setSelectedLayers(preset);
      }
    } catch {
      setAvailableLayers([]);
      setRecommendedLayers([]);
    } finally {
      setLayersLoading(false);
    }
  };

  const refreshAll = async () => {
    // refresh images + layers
    await Promise.all([fetchPictures(), fetchLayers()]);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // ===========================
  // Generate activations
  // ===========================
  const generate = async () => {
    if (!selectedPictureId) return;
    if (!selectedLayers.length) return;

    setGenerating(true);
    setResult(null);

    try {
      const resp = await axiosInstance.post<ActivationsResponse>(
        `/pictures/${selectedPictureId}/activations`,
        {
          layers: selectedLayers,
          include_heatmaps: includeHeatmaps,
          include_overlays: includeOverlays,
        },
      );

      setResult(resp.data);
    } finally {
      setGenerating(false);
    }
  };

  // ===========================
  // Items affichés
  // ===========================
  const items = useMemo(() => {
    const it = result?.activations?.items ?? [];
    return Array.isArray(it) ? it : [];
  }, [result]);

  const originals = useMemo(
    () => items.filter((x) => x.type === "original"),
    [items],
  );
  const overlays = useMemo(
    () => items.filter((x) => x.type === "overlay"),
    [items],
  );
  const heatmaps = useMemo(
    () => items.filter((x) => x.type === "heatmap"),
    [items],
  );

  // ===========================
  // Layers list affichée
  // ===========================
  const layersForUI = useMemo(() => {
    if (recommendedLayers.length) return recommendedLayers;
    // fallback : montrer un sous-ensemble raisonnable si pas de recommended
    const preferred = [
      "conv1",
      "layer1.0.conv1",
      "layer1.2.conv3",
      "layer2.0.conv1",
      "layer2.3.conv3",
      "layer3.0.conv1",
      "layer3.5.conv3",
      "layer4.2.conv3",
      "avgpool",
    ];
    const existingPreferred = preferred.filter((x) =>
      availableLayers.includes(x),
    );
    if (existingPreferred.length) return existingPreferred;

    // sinon, limiter à 30 premières pour ne pas tuer l’UI
    return availableLayers.slice(0, 30);
  }, [availableLayers, recommendedLayers]);

  // ===========================
  // Picture selector modal item
  // ===========================
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
          source={{ uri: `${baseURL}${item.thumbUrl}` }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </Pressable>
    );
  };

  // ===========================
  // UI
  // ===========================
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
              Visualisation des activations
            </Text>
          </View>

          <TouchableOpacity
            onPress={refreshAll}
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

        {/* Select image (bouton + modal grid) */}
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
                  source={{ uri: `${baseURL}${selectedPicture.thumbUrl}` }}
                  style={{ width: 44, height: 44, borderRadius: 12 }}
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

        {/* Layers chips (5–8 recommandé) */}
        <View className="gap-2">
          <Text style={{ color: Colors.text, fontWeight: "700" }}>
            Couches à visualiser (recommandé: 5 à 8)
          </Text>

          <View
            style={{
              backgroundColor: Colors.inputBackground,
              borderRadius: BorderRadius.md,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 10,
            }}
          >
            {layersLoading ? (
              <ActivityIndicator />
            ) : (
              <ScrollView
                style={{ maxHeight: 160 }}
                showsVerticalScrollIndicator
              >
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "flex-start",
                    columnGap: 10,
                    rowGap: 10,
                  }}
                >
                  {layersForUI.map((layer) => {
                    const selected = isSelected(layer);

                    return (
                      <Pressable
                        key={layer}
                        onPress={() => toggleLayer(layer)}
                        style={{
                          width: "31%", // 3 colonnes + columnGap
                          paddingVertical: 12,
                          borderRadius: BorderRadius.lg,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: selected
                            ? Colors.primary
                            : Colors.white,
                          borderWidth: 1,
                          borderColor: selected
                            ? Colors.primary
                            : Colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color: selected ? Colors.white : Colors.text,
                            fontWeight: "600",
                            fontSize: 12,
                            textAlign: "center",
                          }}
                          numberOfLines={1}
                        >
                          {layer}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>
        </View>

        {/* Toggle overlays/heatmaps */}
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
          disabled={
            generating || !selectedPictureId || selectedLayers.length === 0
          }
          style={{
            backgroundColor: Colors.primary,
            borderRadius: BorderRadius.full,
            paddingVertical: 14,
            alignItems: "center",
            opacity:
              generating || !selectedPictureId || selectedLayers.length === 0
                ? 0.6
                : 1,
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

        {/* Images */}
        {result && (
          <View style={{ gap: 14 }}>
            {overlays.length > 0 && (
              <View style={{ gap: 8 }}>
                <Text style={{ color: Colors.text, fontWeight: "800" }}>
                  Overlays
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    {overlays.map((it) => (
                      <View
                        key={`${it.layer}-${it.type}-${it.url}`}
                        style={{ gap: 6 }}
                      >
                        <Image
                          source={{ uri: `${baseURL}${it.url}` }}
                          style={{ width: 160, height: 160, borderRadius: 14 }}
                        />
                        <Text
                          style={{ color: Colors.textSecondary, fontSize: 12 }}
                        >
                          {it.layer}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {heatmaps.length > 0 && (
              <View style={{ gap: 8 }}>
                <Text style={{ color: Colors.text, fontWeight: "800" }}>
                  Heatmaps
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    {heatmaps.map((it) => (
                      <View
                        key={`${it.layer}-${it.type}-${it.url}`}
                        style={{ gap: 6 }}
                      >
                        <Image
                          source={{ uri: `${baseURL}${it.url}` }}
                          style={{ width: 160, height: 160, borderRadius: 14 }}
                        />
                        <Text
                          style={{ color: Colors.textSecondary, fontSize: 12 }}
                        >
                          {it.layer}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
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

              <View style={{ flexDirection: "row", gap: 10 }}>
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
