import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axiosInstance from "@/api/axiosConfig";
import { toFileUri } from "@/utils/image";
import { useAuth } from "@/hooks/auth/useAuth";
import type HistoryDTO from "@/api/DTO/history.dto";

export function useHistory() {
  const [items, setItems] = useState<HistoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { user } = useAuth();
  const navigation = useNavigation();

  const load = useCallback(async () => {
    if (!user) {
      navigation.navigate("index" as never);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get<HistoryDTO[]>("/histories");
      setItems(res.data ?? []);
    } catch {
      setError("Impossible de charger l'historique");
    } finally {
      setLoading(false);
    }
  }, [user, navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const formatDateTime = useCallback((iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch {
      return iso;
    }
  }, []);

  const previewUri = useMemo(() => (preview ? toFileUri(preview) : null), [preview]);

  return {
    items,
    loading,
    error,
    preview,
    previewUri,
    setPreview,
    formatDateTime,
  };
}
