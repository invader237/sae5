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
import { Colors, BorderRadius, Shadows } from "@/constants/theme";

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
      <View
        className="p-4 gap-4"
        style={{
          backgroundColor: Colors.cardBackground,
          borderRadius: BorderRadius.lg,
          ...Shadows.md,
        }}
      >
        <Text className="text-lg font-bold" style={{ color: Colors.text }}>
          Statistiques du modèle
        </Text>

        {loadingSummary ? (
          <View className="items-center py-4">
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text className="text-sm mt-2" style={{ color: Colors.textSecondary }}>
              Chargement...
            </Text>
          </View>
        ) : errorSummary ? (
          <View className="items-center py-4 gap-2">
            <MaterialIcons name="error-outline" size={32} color={Colors.danger} />
            <Text className="text-center" style={{ color: Colors.danger }}>
              {errorSummary}
            </Text>
            <TouchableOpacity
              onPress={retrySummary}
              className="px-4 py-2 rounded-md mt-2"
              style={{
                backgroundColor: Colors.inputBackground,
                borderRadius: BorderRadius.md,
              }}
            >
              <Text className="font-semibold" style={{ color: Colors.info }}>
                Réessayer
              </Text>
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
            <View
              className="flex-1 rounded-lg p-4 items-center"
              style={{
                backgroundColor: Colors.infoLight,
                borderWidth: 1,
                borderColor: Colors.info,
              }}
            >
              <Text className="text-3xl font-bold" style={{ color: Colors.info }}>
                {summary.validated_images}
              </Text>
              <Text className="text-sm mt-1 text-center" style={{ color: Colors.textSecondary }}>
                Images validées
              </Text>
            </View>

            {/* Card 2: Score moyen */}
            <View
              className="flex-1 rounded-lg p-4 items-center"
              style={{
                backgroundColor: Colors.successLight,
                borderWidth: 1,
                borderColor: Colors.success,
              }}
            >
              <Text className="text-3xl font-bold" style={{ color: Colors.success }}>
                {(summary.avg_score * 100).toFixed(1)}%
              </Text>
              <Text className="text-sm mt-1 text-center" style={{ color: Colors.textSecondary }}>
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
          className="rounded-md py-3 items-center"
          style={{
            backgroundColor: hasNoValidatedImages ? Colors.border : Colors.primary,
          }}
        >
          <Text
            className="font-semibold"
            style={{
              color: hasNoValidatedImages ? Colors.textMuted : Colors.white,
            }}
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
        <View className="flex-1 p-4" style={{ backgroundColor: Colors.background }}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold" style={{ color: Colors.text }}>
              Statistiques détaillées
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Text className="text-lg" style={{ color: Colors.primary }}>
                Fermer
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1">
            {loadingDetailed ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text className="mt-2" style={{ color: Colors.textSecondary }}>
                  Chargement des graphiques...
                </Text>
              </View>
            ) : errorDetailed ? (
              <View className="items-center py-8 gap-3">
                <MaterialIcons name="error-outline" size={48} color={Colors.danger} />
                <Text className="text-center" style={{ color: Colors.danger }}>
                  {errorDetailed}
                </Text>
                <TouchableOpacity
                  onPress={retryDetailed}
                  className="px-6 py-2 rounded-md mt-2"
                  style={{
                    backgroundColor: Colors.primary,
                    borderRadius: BorderRadius.md,
                  }}
                >
                  <Text className="font-semibold" style={{ color: Colors.onPrimary }}>
                    Réessayer
                  </Text>
                </TouchableOpacity>
              </View>
            ) : detailed ? (
              <View className="gap-6 pb-8">
                {/* Accuracy Global */}
                <AccuracyGauge value={detailed.accuracy_global} />

                {/* Confusion Matrix */}
                <View className="gap-2">
                  <Text className="text-base font-bold" style={{ color: Colors.text }}>
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
                  <Text className="text-base font-bold" style={{ color: Colors.text }}>
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
