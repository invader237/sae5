import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, FlatList } from "react-native";
import { validatePictures, deletePicturesPva, fetchToValidatePictures } from "@/api/picture.api";
import PictureItem from "@/components/pva-components/PvaPictureItem";
import PvaEditModal from "@/components/pva-components/PvaEditModal";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";

interface Props {
  visible: boolean;
  onClose: () => void;
  refreshKey: number;
  onValidated?: (ids: string[]) => void;
  onDeleted?: (ids: string[]) => void;
}

const ITEMS_PER_PAGE = 6;

const PvaModal = ({ visible, onClose, refreshKey, onValidated, onDeleted }: Props) => {
  const [selectedPictures, setSelectedPictures] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [page, setPage] = useState(1);
  const [pictures, setPictures] = useState<PicturePvaDTO[]>([]);
  const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
      if (!visible) return;

      const fetchInitial = async () => {
        const data = await fetchToValidatePictures(ITEMS_PER_PAGE, 0);
        setPictures(data);
        setPage(1);
        setHasMore(data.length === ITEMS_PER_PAGE);
      };

      fetchInitial();
    }, [visible, refreshKey]); 

    const loadMore = async () => {
      if (!hasMore) return;

      const offset = page * ITEMS_PER_PAGE;
      const more = await fetchToValidatePictures(ITEMS_PER_PAGE, offset);

      if (more.length === 0) {
        setHasMore(false);
        return;
      }

      setPictures(prev => [...prev, ...more]);
      setPage(prev => prev + 1);
    };

  const toggleSelect = (id: string) => {
    setSelectedPictures((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleValidate = async () => {
    try {
      const picturesToValidate = pictures.filter(pic => selectedPictures.includes(pic.id));
      await validatePictures(picturesToValidate);
      onValidated?.(selectedPictures);
      setSelectedPictures([]);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la validation :", error);
    }
  };

  const handleDelete = async () => {
    if (selectedPictures.length === 0) return;
    const confirmed = confirm(
      `Voulez-vous vraiment supprimer ${selectedPictures.length} image(s) ?`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const picturesToDelete = pictures.filter(pic => selectedPictures.includes(pic.id));
      await deletePicturesPva(picturesToDelete);
      onDeleted?.(selectedPictures);
      setSelectedPictures([]);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Impossible de supprimer les images.");
    } finally {
      setIsDeleting(false);
    }
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
              Aucune image à valider pour le moment.
            </Text>
          }
        />

        {/* Footer actions */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={handleValidate}
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
          selectedPictures={pictures.filter(pic => selectedPictures.includes(pic.id))}
          onConfirm={(updatedPictures) => {
            console.log("Images mises à jour :", updatedPictures);
            setSelectedPictures([]);
            setEditModalVisible(false);
            onValidated?.(ids);
            onClose();
          }}
        />
      </View>
    </Modal>
  );
};

export default PvaModal;
