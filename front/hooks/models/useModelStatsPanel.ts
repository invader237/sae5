import { useState, useCallback } from "react";
import { useModelStats } from "./useModelStats";

interface UseModelStatsPanelParams {
  modelId: string | null;
  refreshKey?: number;
}

export function useModelStatsPanel({
  modelId,
  refreshKey,
}: UseModelStatsPanelParams) {
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

  const hasNoValidatedImages = !!(summary && summary.validated_images === 0);

  return {
    // Data
    summary,
    detailed,

    // Loading states
    loadingSummary,
    loadingDetailed,

    // Error states
    errorSummary,
    errorDetailed,

    // Modal state
    modalVisible,

    // Computed
    hasNoValidatedImages,
    shouldRender: !!modelId,

    // Actions
    openModal,
    closeModal,
    retrySummary,
    retryDetailed,
    loadSummary,
    loadDetailed,
  };
}
