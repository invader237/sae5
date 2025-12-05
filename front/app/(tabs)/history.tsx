import { Text, View, Image, TouchableOpacity, Modal } from "react-native";
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import axiosInstance, { baseURL } from "../../api/axiosConfig";

type HistoryItem = {
  id: string;
  image_path: string;
  picture_id?: string | null;
  room_name?: string | null;
  scanned_at: string;
};

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get<HistoryItem[]>("/histories");
      setItems(res.data ?? []);
    } catch (e: any) {
      setError("Impossible de charger l'historique");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch {
      return iso;
    }
  };

  return (
    <View className="flex-1 bg-white px-4 py-6">
      <Text className="text-[24px] font-bold text-[#007bff] mb-4">Historique</Text>

      {loading && (
        <Text className="text-[#555]">Chargement…</Text>
      )}

      {!loading && items.length === 0 && (
        <Text className="text-[#555] text-base">Aucun historique pour le moment.</Text>
      )}

      {!loading && items.length > 0 && (
        <View>
          {items.map((it) => (
            <View
              key={it.id}
              className="flex-row items-center border-b border-[#eee] py-5"
            >
              <TouchableOpacity onPress={() => setPreview(toFileUri(it.picture_id, it.image_path))}>
                <Image
                  source={{ uri: toFileUri(it.picture_id, it.image_path) }}
                  style={{ width: 64, height: 64, borderRadius: 8, marginRight: 14 }}
                />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-[#111] font-bold text-lg">
                  {it.room_name ?? "Salle inconnue"}
                </Text>
                <Text className="text-[#666] text-sm mt-1">
                  {formatDateTime(it.scanned_at)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <View className="flex-1 bg-[rgba(0,0,0,0.8)] items-center justify-center">
          {preview && (
            <Image
              source={{ uri: preview }}
              style={{ width: "90%", height: "70%", resizeMode: "contain" }}
            />
          )}
          <TouchableOpacity onPress={() => setPreview(null)} className="mt-4">
            <Text className="text-white text-base">Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

function toFileUri(pictureId?: string | null, fallbackPath?: string) {
  if (pictureId) {
    return `${baseURL}/pictures/${pictureId}/recover?type=full`;
  }
  if (fallbackPath && (fallbackPath.startsWith("http://") || fallbackPath.startsWith("https://"))) {
    return fallbackPath;
  }
  return "https://placehold.co/400x400/000000/FFFFFF.png";
}
