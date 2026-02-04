import React from "react";
import { Text, View, Image, TouchableOpacity, Modal, ScrollView } from "react-native";
import { toFileUri } from "../../utils/image";
import { useHistory } from "@/hooks/history/useHistory";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function HistoryScreen() {
  const {
    items,
    loading,
    error,
    preview,
    previewUri,
    setPreview,
    formatDateTime,
  } = useHistory();

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      <ScrollView 
        className="flex-1 px-5 py-6" 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View className="mb-6">
          <Text 
            className="text-3xl font-bold"
            style={{ color: Colors.text }}
          >
            Historique
          </Text>
        </View>

        {loading && (
          <View 
            className="p-6 items-center"
            style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.lg,
              ...Shadows.md,
            }}
          >
            <Text style={{ color: Colors.textSecondary }}>Chargement…</Text>
          </View>
        )}

        {error && (
          <View 
            className="p-4 flex-row items-center"
            style={{
              backgroundColor: Colors.dangerLight,
              borderRadius: BorderRadius.md,
            }}
          >
            <MaterialIcons name="error" size={20} color={Colors.danger} />
            <Text className="ml-2" style={{ color: Colors.danger }}>{error}</Text>
          </View>
        )}

        {!loading && !error && items.length === 0 && (
          <View 
            className="p-8 items-center"
            style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.lg,
              ...Shadows.md,
            }}
          >
            <MaterialIcons name="history" size={48} color={Colors.textMuted} />
            <Text 
              className="text-base mt-4 text-center"
              style={{ color: Colors.textSecondary }}
            >
              Aucun historique pour le moment.
            </Text>
          </View>
        )}

        {!loading && items.length > 0 && (
          <View className="gap-3">
            {items.map((it) => (
              <TouchableOpacity
                key={it.id}
                onPress={() => setPreview(it.image_id ?? null)}
                className="flex-row items-center p-4"
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: BorderRadius.lg,
                  ...Shadows.sm,
                }}
              >
                <Image
                  source={{ uri: toFileUri(it.image_id) }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: BorderRadius.md,
                    marginRight: 14,
                  }}
                />
                <View className="flex-1">
                  <Text 
                    className="font-bold text-lg"
                    style={{ color: Colors.text }}
                  >
                    {it.room_name ?? "Salle inconnue"}
                  </Text>
                  <Text 
                    className="text-sm mt-1"
                    style={{ color: Colors.textSecondary }}
                  >
                    {formatDateTime(it.scanned_at)}
                  </Text>
                  <Text 
                    className="text-sm mt-1"
                    style={{ color: Colors.textMuted }}
                  >
                    Modèle : {it.model?.name ?? "Inconnu"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <View 
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
        >
          {previewUri && (
            <Image
              source={{ uri: previewUri }}
              style={{ width: "90%", height: "70%", resizeMode: "contain" }}
            />
          )}
          <TouchableOpacity 
            onPress={() => setPreview(null)} 
            className="mt-6 px-8 py-3"
            style={{
              backgroundColor: Colors.white,
              borderRadius: BorderRadius.full,
            }}
          >
            <Text 
              className="font-semibold"
              style={{ color: Colors.text }}
            >
              Fermer
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

