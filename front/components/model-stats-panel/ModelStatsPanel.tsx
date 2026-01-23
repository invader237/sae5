import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useModelStats } from "@/hooks/models/useModelStats";

interface Props {
  modelId: string | null;
}

export default function ModelStatsPanel({ modelId }: Props) {
  const {
    summary,
    detailed,
    loadingSummary,
    loadingDetailed,
    errorSummary,
    loadDetailed,
  } = useModelStats(modelId);

  const [modalVisible, setModalVisible] = useState(false);

  const openModal = async () => {
    setModalVisible(true);
    if (!detailed) {
      await loadDetailed();
    }
  };

  if (!modelId) {
    return null;
  }

  return (
    <>
      {/* KPI Cards */}
      <View className="bg-white p-4 border border-gray-300 rounded-lg gap-4">
        <Text className="text-[#333] text-lg font-bold">
          Statistiques du modèle
        </Text>

        {loadingSummary ? (
          <ActivityIndicator size="small" color="#007bff" />
        ) : errorSummary ? (
          <Text className="text-red-500">{errorSummary}</Text>
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
                {summary.avg_score.toFixed(1)}%
              </Text>
              <Text className="text-sm text-gray-600 mt-1 text-center">
                Score moyen
              </Text>
            </View>
          </View>
        ) : (
          <Text className="text-gray-500">Aucune donnée</Text>
        )}

        {/* Button to open detailed modal */}
        <TouchableOpacity
          onPress={openModal}
          className="bg-[#007bff] rounded-md py-3 items-center"
        >
          <Text className="text-white font-semibold">
            Voir les statistiques détaillées
          </Text>
        </TouchableOpacity>
      </View>

      {/* Detailed Stats Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl max-h-[85%]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800">
                Statistiques détaillées
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-blue-500 font-semibold">Fermer</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView className="p-4">
              {loadingDetailed ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#007bff" />
                  <Text className="text-gray-500 mt-2">Chargement...</Text>
                </View>
              ) : detailed ? (
                <View className="gap-6 pb-8">
                  {/* Accuracy Global */}
                  <View className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 items-center">
                    <Text className="text-4xl font-bold text-indigo-600">
                      {(detailed.accuracy_global * 100).toFixed(1)}%
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      Précision globale
                    </Text>
                  </View>

                  {/* Confusion Matrix */}
                  <View className="gap-2">
                    <Text className="text-base font-bold text-gray-800">
                      Matrice de confusion
                    </Text>
                    {detailed.confusion_matrix.length === 0 ? (
                      <Text className="text-gray-500">
                        Aucune donnée disponible
                      </Text>
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
                      <Text className="text-gray-500">
                        Aucune donnée disponible
                      </Text>
                    ) : (
                      <AccuracyTimeline data={detailed.accuracy_over_time} />
                    )}
                  </View>
                </View>
              ) : (
                <Text className="text-gray-500 text-center py-8">
                  Impossible de charger les statistiques
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ---------- Sub-components ---------- */

interface ConfusionMatrixTableProps {
  matrix: {
    actual_room_id: string | null;
    predicted_room_id: string | null;
    count: number;
  }[];
  rooms: { id: string; name: string }[];
}

function ConfusionMatrixTable({ matrix, rooms }: ConfusionMatrixTableProps) {
  const roomMap = new Map(rooms.map((r) => [r.id, r.name]));
  const roomIds = rooms.map((r) => r.id);

  // Build a 2D lookup: map[actual][predicted] = count
  const lookup = new Map<string, Map<string, number>>();
  matrix.forEach((cell) => {
    if (!cell.actual_room_id || !cell.predicted_room_id) return;
    if (!lookup.has(cell.actual_room_id)) {
      lookup.set(cell.actual_room_id, new Map());
    }
    lookup.get(cell.actual_room_id)!.set(cell.predicted_room_id, cell.count);
  });

  // Find max value for color scaling
  const maxCount = Math.max(...matrix.map((c) => c.count), 1);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View>
        {/* Header row */}
        <View className="flex-row">
          <View className="w-20 h-10 border border-gray-300 bg-gray-100 justify-center items-center">
            <Text className="text-xs font-bold">Réel ↓</Text>
          </View>
          {roomIds.map((rid) => (
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
        {roomIds.map((actualId) => (
          <View key={actualId} className="flex-row">
            <View className="w-20 h-12 border border-gray-300 bg-gray-100 justify-center px-1">
              <Text className="text-xs" numberOfLines={2}>
                {roomMap.get(actualId) ?? actualId.slice(0, 6)}
              </Text>
            </View>
            {roomIds.map((predictedId) => {
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
  );
}

interface AccuracyTimelineProps {
  data: { bucket: string; accuracy: number; total: number; correct: number }[];
}

function AccuracyTimeline({ data }: AccuracyTimelineProps) {
  return (
    <View className="border border-gray-200 rounded-lg overflow-hidden">
      {data.map((point, idx) => {
        const pct = (point.accuracy * 100).toFixed(1);
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
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${point.accuracy * 100}%` }}
              />
            </View>
            <Text className="text-sm font-semibold w-14 text-right">{pct}%</Text>
          </View>
        );
      })}
    </View>
  );
}
