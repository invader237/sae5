import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useModelStatsPanel } from "@/hooks/models/useModelStatsPanel";
import EmptyStateCard from "./EmptyStateCard";
import AccuracyGauge from "./AccuracyGauge";
import ConfusionMatrixTable from "./ConfusionMatrixTable";
import AccuracyTimeline from "./AccuracyTimeline";

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
    modalVisible,
    hasNoValidatedImages,
    shouldRender,
    openModal,
    closeModal,
    retrySummary,
    retryDetailed,
    loadSummary,
    loadDetailed,
  } = useModelStatsPanel({ modelId, refreshKey });

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

  // Don't render anything if no model selected
  if (!shouldRender) {
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
