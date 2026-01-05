import { Text, View, Image, TouchableOpacity, Modal, ScrollView } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axiosInstance from "../../api/axiosConfig";
import { toFileUri } from "../../utils/image";
import { useAuth } from "../../hooks/useAuth";
import type HistoryDTO from "../../api/DTO/history.dto";

export default function HistoryScreen() {
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

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch {
      return iso;
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 20 }}>
        <Text className="text-[24px] font-bold text-[#007bff] mb-4">Historique</Text>

        {loading && (
          <Text className="text-[#555]">Chargement…</Text>
        )}

        {error && (
          <Text className="text-red-500 text-base">{error}</Text>
        )}

        {!loading && !error && items.length === 0 && (
          <Text className="text-[#555] text-base">Aucun historique pour le moment.</Text>
        )}

        {!loading && items.length > 0 && (
          <View>
            {items.map((it) => (
              <View
                key={it.id}
                className="flex-row items-center border-b border-[#eee] py-5"
              >
                <TouchableOpacity onPress={() => setPreview(toFileUri(it.image_id))}>
                  <Image
                    source={{ uri: toFileUri(it.image_id) }}
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
                  <Text className="text-[#666] text-sm mt-1">
                    Modèle : {it.model?.name ?? "Inconnu"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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

