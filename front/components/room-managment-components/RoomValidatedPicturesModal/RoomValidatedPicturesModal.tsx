import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, FlatList, Alert, Platform } from "react-native";

import PictureItem from "@/components/pva-components/PvaPictureItem";
import PvaEditModal from "@/components/pva-components/PvaEditModal";
import { Spinner } from "@/components/Spinner";
import { useValidatedPicturesByRoom } from "@/hooks/rooms/useValidatedPicturesByRoom";
import { useValidatedPicturesActions } from "@/hooks/rooms/useValidatedPicturesActions";
import { Colors, BorderRadius } from "@/constants/theme";

export type RoomValidatedPicturesModalMode = "gestion" | "display";

type Props = {
  visible: boolean;
  onClose: () => void;

  roomId: string | null;
  mode: RoomValidatedPicturesModalMode;

  onDeleted?: (ids: string[]) => void;
  onUpdated?: () => void;
};

const ITEMS_PER_PAGE = 6;

const RoomValidatedPicturesModal = ({
  visible,
  onClose,
  roomId,
  mode,
  onDeleted,
  onUpdated,
}: Props) => {
  const [editModalVisible, setEditModalVisible] = useState(false);

  const {
    pictures,
    isLoading,
    errorMessage,
    refresh,
    loadMore,
    removeByIds,
  } = useValidatedPicturesByRoom({
    roomId,
    visible,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const canSelect = mode === "gestion";

  const {
    selectedPictures,
    isDeleting,
    toggleSelect,
    clearSelection,
    deleteSelected,
  } = useValidatedPicturesActions({
    pictures,
    removeByIds,
    refresh,
    onDeleted,
    onUpdated,
    onError: (message) => Alert.alert("Erreur", message),
  });

  const handleDelete = () => {
    if (!canSelect) return;
    if (selectedPictures.length === 0) return;

    if (Platform.OS === "web") {
      const confirmed = confirm(
        `Voulez-vous vraiment supprimer ${selectedPictures.length} image(s) ?`
      );
      if (!confirmed) return;
      void deleteSelected();
      return;
    }

    Alert.alert(
      "Confirmer",
      `Voulez-vous vraiment supprimer ${selectedPictures.length} image(s) ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            void deleteSelected();
          },
        },
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 p-4" style={{ backgroundColor: Colors.background }}>
        {isLoading && <Spinner overlay />}

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold" style={{ color: Colors.text }}>
            Images validées
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-lg" style={{ color: Colors.primary }}>
              Fermer
            </Text>
          </TouchableOpacity>
        </View>

        {errorMessage && (
          <View className="mb-3">
            <Text className="text-center" style={{ color: Colors.danger }}>
              {errorMessage}
            </Text>
            <TouchableOpacity
              onPress={refresh}
              className="mt-3 px-4 py-2"
              style={{
                backgroundColor: Colors.primary,
                borderRadius: BorderRadius.md,
              }}
            >
              <Text className="font-bold text-center" style={{ color: Colors.onPrimary }}>
                Réessayer
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={pictures}
          keyExtractor={(item, index) => item.id ?? String(index)}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "center", gap: 20 }}
          contentContainerStyle={{ paddingBottom: 20, gap: 20 }}
          renderItem={({ item }) => (
            <PictureItem
              picture={item}
              isSelected={canSelect && selectedPictures.includes(item.id ?? "")}
              onPress={canSelect ? toggleSelect : undefined}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <Text className="text-center mt-10" style={{ color: Colors.textSecondary }}>
              {isLoading ? "Chargement..." : "Aucune image validée pour le moment."}
            </Text>
          }
        />

        {mode === "gestion" && (
          <View className="flex-row items-center justify-between px-4 py-3">
            <TouchableOpacity
              onPress={() => setEditModalVisible(true)}
              disabled={selectedPictures.length === 0}
              className="px-4 py-2 rounded-lg"
              style={{
                backgroundColor:
                  selectedPictures.length > 0 ? Colors.primary : Colors.border,
              }}
            >
              <Text className="font-bold text-sm" style={{ color: Colors.onPrimary }}>
                Modifier
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              disabled={selectedPictures.length === 0 || isDeleting}
              className="px-4 py-2 rounded-lg"
              style={{
                backgroundColor:
                  selectedPictures.length > 0 ? Colors.danger : Colors.border,
              }}
            >
              <Text className="font-bold text-sm" style={{ color: Colors.onPrimary }}>
                {isDeleting ? "Suppression..." : "Supprimer"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <PvaEditModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          selectedPictures={pictures.filter((pic) =>
            selectedPictures.includes(pic.id ?? "")
          )}
          onUpdated={async () => {
            clearSelection();
            await refresh();
            onUpdated?.();
          }}
        />
      </View>
    </Modal>
  );
};

export default RoomValidatedPicturesModal;
