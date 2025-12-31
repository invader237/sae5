import React, { useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, FlatList } from "react-native";

import PicturePvaDTO from "@/api/DTO/picturePva.dto";
import { deletePicturesPva, fetchValidatedPicturesByRoom } from "@/api/picture.api";

import PictureItem from "@/components/pva-components/PvaPictureItem";
import PvaEditModal from "@/components/pva-components/PvaEditModal";

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
  const [selectedPictures, setSelectedPictures] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [page, setPage] = useState(1);
  const [pictures, setPictures] = useState<PicturePvaDTO[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const canSelect = mode === "gestion";

  const fetchInitial = async () => {
    if (!roomId) {
      setPictures([]);
      setPage(1);
      setHasMore(false);
      setSelectedPictures([]);
      return;
    }

    const data = await fetchValidatedPicturesByRoom(roomId, ITEMS_PER_PAGE, 0);
    setPictures(data);
    setPage(1);
    setHasMore(data.length === ITEMS_PER_PAGE);
    setSelectedPictures([]);
  };

  useEffect(() => {
    if (!visible) return;
    fetchInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, roomId]);

  const loadMore = async () => {
    if (!hasMore) return;
    if (!roomId) return;

    const offset = page * ITEMS_PER_PAGE;
    const more = await fetchValidatedPicturesByRoom(roomId, ITEMS_PER_PAGE, offset);

    if (more.length === 0) {
      setHasMore(false);
      return;
    }

    setPictures((prev) => [...prev, ...more]);
    setPage((prev) => prev + 1);
  };

  const toggleSelect = (id: string) => {
    if (!canSelect) return;

    setSelectedPictures((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!canSelect) return;
    if (selectedPictures.length === 0) return;

    const confirmed = confirm(
      `Voulez-vous vraiment supprimer ${selectedPictures.length} image(s) ?`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const picturesToDelete = pictures.filter((pic) =>
        selectedPictures.includes(pic.id ?? "")
      );

      await deletePicturesPva(picturesToDelete);

      const deletedIds = [...selectedPictures];
      setPictures((prev) => prev.filter((p) => !deletedIds.includes(p.id ?? "")));
      setSelectedPictures([]);
      onDeleted?.(deletedIds);
      onUpdated?.();

      if (picturesToDelete.length > 0 && pictures.length === picturesToDelete.length) {
        // If we deleted everything on the first page, refresh to keep pagination coherent
        await fetchInitial();
      }
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
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-[#333]">Images validées</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-500 text-lg">Fermer</Text>
          </TouchableOpacity>
        </View>

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
            <Text className="text-center text-[#555] mt-10">
              Aucune image validée pour le moment.
            </Text>
          }
        />

        {mode === "gestion" && (
          <View className="flex-row items-center justify-between px-4 py-3">
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
              className={`px-4 py-2 rounded-lg ${
                selectedPictures.length > 0 ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              <Text className="text-white font-bold text-sm">
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
            await fetchInitial();
            onUpdated?.();
          }}
        />
      </View>
    </Modal>
  );
};

export default RoomValidatedPicturesModal;
