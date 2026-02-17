import { useCallback, useEffect, useState } from "react";
import { fetchPvaStatus, fetchPvaToValidateCount, togglePvaStatus } from "@/api/picture.api";

export function usePvaStatus() {
  const [pvaEnabled, setPvaEnabled] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await fetchPvaStatus();
      setPvaEnabled(status.enabled);

      const count = await fetchPvaToValidateCount();
      setPendingCount(count);
    } catch (error) {
      console.error("Erreur chargement statut PVA :", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggle = useCallback(async () => {
    setIsToggling(true);
    try {
      const result = await togglePvaStatus(!pvaEnabled);
      setPvaEnabled(result.enabled);
      const count = await fetchPvaToValidateCount();
      setPendingCount(count);
    } catch (error) {
      console.error("Erreur toggle PVA :", error);
    } finally {
      setIsToggling(false);
    }
  }, [pvaEnabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { pvaEnabled, pendingCount, isLoading, isToggling, toggle, refresh };
}
