import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, FlatList, Alert, Platform } from "react-native";
import PictureItem from "@/components/pva-components/PvaPictureItem";
import PvaEditModal from "@/components/pva-components/PvaEditModal";
import { usePvaPictures } from "@/hooks/pva/usePvaPictures";
import { usePvaModalActions } from "@/hooks/pva/usePvaModalActions";

interface Props {
  visible: boolean;
  onClose: () => void;
  refreshKey: number;
  onValidated?: (ids: string[]) => void;
  onDeleted?: (ids: string[]) => void;
}

const ITEMS_PER_PAGE = 6;

const PvaModal = ({ visible, onClose, refreshKey, onValidated, onDeleted }: Props) => {
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
      <View className="flex-1 bg-white p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-[#333]">
            Images à valider
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-500 text-lg">Fermer</Text>
          </TouchableOpacity>
        </View>

        {/* Liste optimisée */}
        <FlatList
          data={pictures}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "center", gap: 20 }}
          contentContainerStyle={{ paddingBottom: 20, gap: 20 }}
          renderItem={({ item }) => (
            <PictureItem
              picture={item}
              isSelected={selectedPictures.includes(item.id)}
              onPress={toggleSelect}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <Text className="text-center text-[#555] mt-10">
              {isLoading ? "Chargement…" : "Aucune image à valider pour le moment."}
            </Text>
          }
        />

        {/* Footer actions */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={validateSelected}
            disabled={selectedPictures.length === 0}
            className={`px-4 py-2 rounded-lg ${selectedPictures.length > 0 ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <Text className="text-white font-bold text-sm">
              Valider ({selectedPictures.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setEditModalVisible(true)}
            disabled={selectedPictures.length === 0}
            className={`px-4 py-2 rounded-lg ${
              selectedPictures.length > 0 ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <Text className="text-white font-bold text-sm">Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={selectedPictures.length === 0 || isDeleting}
            className={`px-4 py-2 rounded-lg ${selectedPictures.length > 0 ? "bg-red-500" : "bg-gray-300"}`}
          >
            <Text className="text-white font-bold text-sm">
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal de modification */}
        <PvaEditModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          selectedPictures={pictures.filter((pic) => selectedPictures.includes(pic.id))}
          onUpdated={async () => {
            clearSelection();
            setEditModalVisible(false);
            await refresh();
          }}
        />
      </View>
    </Modal>
  );
};

export default PvaModal;
