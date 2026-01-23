import { useCallback, useEffect, useState } from "react";
import {
  fetchModelStatsSummary,
  fetchModelStatsDetailed,
} from "@/api/model.api";
import type {
  ModelStatsSummaryDTO,
  ModelStatsDetailedDTO,
} from "@/api/DTO/modelStats.dto";

export function useModelStats(modelId: string | null) {
  const [summary, setSummary] = useState<ModelStatsSummaryDTO | null>(null);
  const [detailed, setDetailed] = useState<ModelStatsDetailedDTO | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingDetailed, setLoadingDetailed] = useState(false);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);
  const [errorDetailed, setErrorDetailed] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!modelId) {
      setSummary(null);
      return;
    }
    setLoadingSummary(true);
    setErrorSummary(null);
    try {
      const data = await fetchModelStatsSummary(modelId);
      setSummary(data);
    } catch (err: any) {
      setErrorSummary(err?.message ?? "Erreur lors du chargement des stats");
    } finally {
      setLoadingSummary(false);
    }
  }, [modelId]);

  const loadDetailed = useCallback(async () => {
    if (!modelId) {
      setDetailed(null);
      return;
    }
    setLoadingDetailed(true);
    setErrorDetailed(null);
    try {
      const data = await fetchModelStatsDetailed(modelId);
      setDetailed(data);
    } catch (err: any) {
      setErrorDetailed(err?.message ?? "Erreur lors du chargement des stats");
    } finally {
      setLoadingDetailed(false);
    }
  }, [modelId]);

  // Auto-load summary when model changes
  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  return {
    summary,
    detailed,
    loadingSummary,
    loadingDetailed,
    errorSummary,
    errorDetailed,
    loadSummary,
    loadDetailed,
  };
}
