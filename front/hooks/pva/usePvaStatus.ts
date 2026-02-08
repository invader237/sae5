import { useCallback, useEffect, useState } from "react";
import { fetchPvaStatus, fetchPvaToValidateCount } from "@/api/picture.api";

export function usePvaStatus() {
  const [pvaEnabled, setPvaEnabled] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await fetchPvaStatus();
      setPvaEnabled(status.enabled);

      if (status.enabled) {
        const count = await fetchPvaToValidateCount();
        setPendingCount(count);
      } else {
        setPendingCount(0);
      }
    } catch (error) {
      console.error("Erreur chargement statut PVA :", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { pvaEnabled, pendingCount, isLoading, refresh };
}
