import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, FlatList, Alert, Platform } from "react-native";
import PictureItem from "@/components/pva-components/PvaPictureItem";
import PvaEditModal from "@/components/pva-components/PvaEditModal";
import { usePvaPictures } from "@/hooks/pva/usePvaPictures";
import { usePvaModalActions } from "@/hooks/pva/usePvaModalActions";
import { Colors, BorderRadius } from "@/constants/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  refreshKey: number;
  onValidated?: (ids: string[]) => void;
  onDeleted?: (ids: string[]) => void;
  onUpdated?: () => void;
}

const ITEMS_PER_PAGE = 6;

const PvaModal = ({
  visible,
  onClose,
  refreshKey,
  onValidated,
  onDeleted,
  onUpdated,
}: Props) => {
  const [editModalVisible, setEditModalVisible] = useState(false);

  const {
    pictures,
    setPictures,
    isLoading,
    loadMore,
    refresh,
  } = usePvaPictures({
    visible,
    refreshKey,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const {
    selectedPictures,
    isDeleting,
    toggleSelect,
    clearSelection,
    validateSelected,
    deleteSelected,
  } = usePvaModalActions({
    pictures,
    setPictures,
    onValidated,
    onDeleted,
    onClose,
    onError: (message) => alert(message),
  });

  const handleDelete = () => {
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
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold" style={{ color: Colors.text }}>
            Images à valider
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-lg" style={{ color: Colors.info }}>
              Fermer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Liste optimisée */}
        <FlatList
          data={pictures}
          keyExtractor={(item, index) => {
            if (!item.id) {
              console.warn("Picture without id", item);
              return index.toString();
            }
            return item.id;
          }}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "center", gap: 20 }}
          contentContainerStyle={{ paddingBottom: 20, gap: 20 }}
          renderItem={({ item }) => (
            <PictureItem
              picture={item}
              isSelected={item.id ? selectedPictures.includes(item.id) : false}
              onPress={toggleSelect}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <Text className="text-center mt-10" style={{ color: Colors.textSecondary }}>
              {isLoading ? "Chargement…" : "Aucune image à valider pour le moment."}
            </Text>
          }
        />

        {/* Footer actions */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={validateSelected}
            disabled={selectedPictures.length === 0}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor:
                selectedPictures.length > 0 ? Colors.primary : Colors.border,
              borderRadius: BorderRadius.md,
            }}
          >
            <Text className="font-bold text-sm" style={{ color: Colors.onPrimary }}>
              Valider ({selectedPictures.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setEditModalVisible(true)}
            disabled={selectedPictures.length === 0}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor:
                selectedPictures.length > 0 ? Colors.primary : Colors.border,
              borderRadius: BorderRadius.md,
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
              borderRadius: BorderRadius.md,
            }}
          >
            <Text className="font-bold text-sm" style={{ color: Colors.onPrimary }}>
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal de modification */}
        <PvaEditModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          selectedPictures={pictures.filter((pic) => pic.id ? selectedPictures.includes(pic.id) : false)}
          onUpdated={async () => {
            clearSelection();
            setEditModalVisible(false);
            await refresh();
            onUpdated?.();
          }}
        />
      </View>
    </Modal>
  );
};

export default PvaModal;
