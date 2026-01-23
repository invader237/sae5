import React, { useState, useMemo, useCallback, useEffect, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useModelStats } from "@/hooks/models/useModelStats";

const MAX_ROOMS_DISPLAYED = 15;

interface Props {
  modelId: string | null;
  refreshKey?: number;
}

export default function ModelStatsPanel({ modelId, refreshKey }: Props) {
  const {
    summary,
    detailed,
    loadingSummary,
    loadingDetailed,
    errorSummary,
    errorDetailed,
    loadSummary,
    loadDetailed,
  } = useModelStats(modelId);

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (refreshKey !== undefined) {
      void loadSummary();
    }
  }, [refreshKey, loadSummary]);

  useEffect(() => {
    if (refreshKey !== undefined && modalVisible) {
      void loadDetailed();
    }
  }, [refreshKey, modalVisible, loadDetailed]);

  const openModal = useCallback(async () => {
    setModalVisible(true);
    await loadDetailed();
  }, [loadDetailed]);

  const closeModal = useCallback(() => setModalVisible(false), []);

  const retrySummary = useCallback(() => {
    void loadSummary();
  }, [loadSummary]);

  const retryDetailed = useCallback(() => {
    void loadDetailed();
  }, [loadDetailed]);

  // Don't render anything if no model selected
  if (!modelId) {
    return null;
  }

  const hasNoValidatedImages = !!(summary && summary.validated_images === 0);

  return (
    <>
      {/* KPI Cards */}
      <View className="bg-white p-4 border border-gray-300 rounded-lg gap-4">
        <Text className="text-[#333] text-lg font-bold">
          Statistiques du modèle
        </Text>

        {loadingSummary ? (
          <View className="items-center py-4">
            <ActivityIndicator size="small" color="#007bff" />
            <Text className="text-gray-500 text-sm mt-2">Chargement...</Text>
          </View>
        ) : errorSummary ? (
          <View className="items-center py-4 gap-2">
            <MaterialIcons name="error-outline" size={32} color="#ef4444" />
            <Text className="text-red-500 text-center">{errorSummary}</Text>
            <TouchableOpacity
              onPress={retrySummary}
              className="bg-gray-100 px-4 py-2 rounded-md mt-2"
            >
              <Text className="text-blue-500 font-semibold">Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : hasNoValidatedImages ? (
          <EmptyStateCard
            icon="image"
            title="Aucune image validée"
            description="Validez des images dans la section Pré-validation pour générer des statistiques."
          />
        ) : summary ? (
          <View className="flex-row gap-4">
            {/* Card 1: Images validées */}
            <View className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4 items-center">
              <Text className="text-3xl font-bold text-blue-600">
                {summary.validated_images}
              </Text>
              <Text className="text-sm text-gray-600 mt-1 text-center">
                Images validées
              </Text>
            </View>

            {/* Card 2: Score moyen */}
            <View className="flex-1 bg-green-50 border border-green-200 rounded-lg p-4 items-center">
              <Text className="text-3xl font-bold text-green-600">
                {(summary.avg_score * 100).toFixed(1)}%
              </Text>
              <Text className="text-sm text-gray-600 mt-1 text-center">
                Score moyen
              </Text>
            </View>
          </View>
        ) : (
          <EmptyStateCard
            icon="analytics"
            title="Données indisponibles"
            description="Impossible de charger les statistiques pour ce modèle."
          />
        )}

        {/* Button to open detailed modal */}
        <TouchableOpacity
          onPress={openModal}
          disabled={hasNoValidatedImages}
          className={`rounded-md py-3 items-center ${
            hasNoValidatedImages ? "bg-gray-300" : "bg-[#007bff]"
          }`}
        >
          <Text
            className={`font-semibold ${
              hasNoValidatedImages ? "text-gray-500" : "text-white"
            }`}
          >
            Voir les statistiques détaillées
          </Text>
        </TouchableOpacity>
      </View>

      {/* Detailed Stats Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-white p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-[#333]">
              Statistiques détaillées
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Text className="text-blue-500 text-lg">Fermer</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1">
            {loadingDetailed ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#007bff" />
                <Text className="text-gray-500 mt-2">
                  Chargement des graphiques...
                </Text>
              </View>
            ) : errorDetailed ? (
              <View className="items-center py-8 gap-3">
                <MaterialIcons name="error-outline" size={48} color="#ef4444" />
                <Text className="text-red-500 text-center">
                  {errorDetailed}
                </Text>
                <TouchableOpacity
                  onPress={retryDetailed}
                  className="bg-blue-500 px-6 py-2 rounded-md mt-2"
                >
                  <Text className="text-white font-semibold">Réessayer</Text>
                </TouchableOpacity>
              </View>
            ) : detailed ? (
              <View className="gap-6 pb-8">
                {/* Accuracy Global */}
                <AccuracyGauge value={detailed.accuracy_global} />

                {/* Confusion Matrix */}
                <View className="gap-2">
                  <Text className="text-base font-bold text-gray-800">
                    Matrice de confusion
                  </Text>
                  {detailed.confusion_matrix.length === 0 ? (
                    <EmptyStateCard
                      icon="grid-on"
                      title="Pas de données"
                      description="La matrice sera disponible après validation d'images."
                    />
                  ) : (
                    <ConfusionMatrixTable
                      matrix={detailed.confusion_matrix}
                      rooms={detailed.rooms}
                    />
                  )}
                </View>

                {/* Accuracy over time */}
                <View className="gap-2">
                  <Text className="text-base font-bold text-gray-800">
                    Évolution de la précision
                  </Text>
                  {detailed.accuracy_over_time.length === 0 ? (
                    <EmptyStateCard
                      icon="show-chart"
                      title="Pas d'historique"
                      description="L'évolution sera disponible après plusieurs jours de validation."
                    />
                  ) : (
                    <AccuracyTimeline data={detailed.accuracy_over_time} />
                  )}
                </View>
              </View>
            ) : (
              <View className="items-center py-8">
                <EmptyStateCard
                  icon="analytics"
                  title="Données indisponibles"
                  description="Impossible de charger les statistiques détaillées."
                />
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

/* ---------- Sub-components ---------- */

interface EmptyStateCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
}

const EmptyStateCard = memo(function EmptyStateCard({
  icon,
  title,
  description,
}: EmptyStateCardProps) {
  return (
    <View className="bg-gray-50 border border-gray-200 rounded-lg p-6 items-center">
      <MaterialIcons name={icon} size={40} color="#9ca3af" />
      <Text className="text-base font-semibold text-gray-700 mt-3">{title}</Text>
      <Text className="text-sm text-gray-500 text-center mt-1">
        {description}
      </Text>
    </View>
  );
});

interface AccuracyGaugeProps {
  value: number;
}

const AccuracyGauge = memo(function AccuracyGauge({ value }: AccuracyGaugeProps) {
  const percentage = (value * 100).toFixed(1);
  const color =
    value >= 0.8 ? "text-green-600" : value >= 0.5 ? "text-yellow-600" : "text-red-600";
  const bgColor =
    value >= 0.8
      ? "bg-green-50 border-green-200"
      : value >= 0.5
      ? "bg-yellow-50 border-yellow-200"
      : "bg-red-50 border-red-200";

  return (
    <View className={`border rounded-lg p-4 items-center ${bgColor}`}>
      <Text className={`text-4xl font-bold ${color}`}>{percentage}%</Text>
      <Text className="text-sm text-gray-600 mt-1">Précision globale</Text>
      <Text className="text-xs text-gray-400 mt-2">
        {value >= 0.8
          ? "Excellente performance"
          : value >= 0.5
          ? "Performance acceptable"
          : "Performance à améliorer"}
      </Text>
    </View>
  );
});

interface ConfusionMatrixTableProps {
  matrix: {
    actual_room_id: string | null;
    predicted_room_id: string | null;
    count: number;
  }[];
  rooms: { id: string; name: string }[];
}

const ConfusionMatrixTable = memo(function ConfusionMatrixTable({
  matrix,
  rooms,
}: ConfusionMatrixTableProps) {
  const { roomMap, displayedRoomIds, isTruncated, lookup, maxCount } = useMemo(() => {
    const rMap = new Map(rooms.map((r) => [r.id, r.name]));
    const allRoomIds = rooms.map((r) => r.id);
    const truncated = allRoomIds.length > MAX_ROOMS_DISPLAYED;
    const displayed = truncated
      ? allRoomIds.slice(0, MAX_ROOMS_DISPLAYED)
      : allRoomIds;

    // Build a 2D lookup: map[actual][predicted] = count
    const lkp = new Map<string, Map<string, number>>();
    matrix.forEach((cell) => {
      if (!cell.actual_room_id || !cell.predicted_room_id) return;
      if (!lkp.has(cell.actual_room_id)) {
        lkp.set(cell.actual_room_id, new Map());
      }
      lkp.get(cell.actual_room_id)!.set(cell.predicted_room_id, cell.count);
    });

    // Find max value for color scaling
    const max = Math.max(...matrix.map((c) => c.count), 1);

    return {
      roomMap: rMap,
      displayedRoomIds: displayed,
      isTruncated: truncated,
      lookup: lkp,
      maxCount: max,
    };
  }, [matrix, rooms]);

  return (
    <View className="gap-2">
      {isTruncated && (
        <View className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
          <Text className="text-xs text-yellow-700 text-center">
            Affichage limité aux {MAX_ROOMS_DISPLAYED} premières salles (
            {rooms.length} au total)
          </Text>
        </View>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View className="items-center">
          {/* Header row */}
          <View className="flex-row">
            <View className="w-20 h-10 border border-gray-300 bg-gray-100 justify-center items-center">
              <Text className="text-xs">Réel ↓</Text>
            </View>
            {displayedRoomIds.map((rid) => (
              <View
                key={rid}
                className="w-16 h-10 border border-gray-300 bg-gray-100 justify-center items-center"
              >
                <Text className="text-xs text-center" numberOfLines={1}>
                  {roomMap.get(rid) ?? rid.slice(0, 4)}
                </Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {displayedRoomIds.map((actualId) => (
            <View key={actualId} className="flex-row">
              <View className="w-20 h-12 border border-gray-300 bg-gray-100 justify-center px-1">
                <Text className="text-xs" numberOfLines={2}>
                  {roomMap.get(actualId) ?? actualId.slice(0, 6)}
                </Text>
              </View>
              {displayedRoomIds.map((predictedId) => {
                const count = lookup.get(actualId)?.get(predictedId) ?? 0;
                const isDiagonal = actualId === predictedId;
                const intensity = count / maxCount;
                const bgColor = isDiagonal
                  ? `rgba(34, 197, 94, ${0.2 + intensity * 0.6})`
                  : count > 0
                  ? `rgba(239, 68, 68, ${0.2 + intensity * 0.5})`
                  : "white";

                return (
                  <View
                    key={predictedId}
                    className="w-16 h-12 border border-gray-300 justify-center items-center"
                    style={{ backgroundColor: bgColor }}
                  >
                    <Text className="text-sm font-semibold">{count}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
      <View className="flex-row items-center gap-4 mt-2">
        <View className="flex-row items-center gap-1">
          <View className="w-4 h-4 bg-green-400 rounded" />
          <Text className="text-xs text-gray-600">Correct</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-4 h-4 bg-red-400 rounded" />
          <Text className="text-xs text-gray-600">Erreur</Text>
        </View>
      </View>
    </View>
  );
});

interface AccuracyTimelineProps {
  data: { bucket: string; accuracy: number; total: number; correct: number }[];
}

const AccuracyTimeline = memo(function AccuracyTimeline({
  data,
}: AccuracyTimelineProps) {
  // Limit to last 30 days if too many entries
  const displayedData = useMemo(() => {
    return data.length > 30 ? data.slice(-30) : data;
  }, [data]);

  return (
    <View className="gap-2">
      {data.length > 30 && (
        <View className="bg-blue-50 border border-blue-200 rounded-md p-2">
          <Text className="text-xs text-blue-700 text-center">
            Affichage des 30 derniers jours
          </Text>
        </View>
      )}
      <View className="border border-gray-200 rounded-lg overflow-hidden">
        {displayedData.map((point, idx) => {
          const pct = (point.accuracy * 100).toFixed(1);
          const barColor =
            point.accuracy >= 0.8
              ? "bg-green-500"
              : point.accuracy >= 0.5
              ? "bg-yellow-500"
              : "bg-red-500";

          return (
            <View
              key={point.bucket}
              className={`flex-row items-center p-3 ${
                idx % 2 === 0 ? "bg-gray-50" : "bg-white"
              }`}
            >
              <Text className="text-sm text-gray-600 w-24">
                {new Date(point.bucket).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                })}
              </Text>
              <View className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden mx-2">
                <View
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${point.accuracy * 100}%` }}
                />
              </View>
              <Text className="text-sm font-semibold w-14 text-right">
                {pct}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});
