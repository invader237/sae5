import React, { useState } from "react";
import { View, Text, ScrollView, Modal, TouchableOpacity } from "react-native";
import { validatePictures, deletePicturesPva } from "@/api/picture.api";
import PictureItem from "@/components/pva-components/PvaPictureItem";
import PvaEditModal from "@/components/pva-components/PvaEditModal";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";

interface Props {
  visible: boolean;
  onClose: () => void;
  picturesData: PicturePvaDTO[];
  onValidated?: (ids: string[]) => void;
  onDeleted?: (ids: string[]) => void;
}

const PvaModal = ({ visible, onClose, picturesData, onValidated, onDeleted }: Props) => {
  const [selectedPictures, setSelectedPictures] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedPictures(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleValidate = async () => {
    try {
      const picturesToValidate = picturesData.filter(pic => selectedPictures.includes(pic.id));
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
    const confirmed = confirm(`Voulez-vous vraiment supprimer ${selectedPictures.length} image(s) ?`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const picturesToDelete = picturesData.filter(pic => selectedPictures.includes(pic.id));
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
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-white p-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-[#333]">Toutes les images à valider</Text>
          <TouchableOpacity onPress={onClose}><Text className="text-blue-500 text-lg">Fermer</Text></TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-2">
          <View className="flex-row flex-wrap justify-center gap-4 mb-4">
            {picturesData.length > 0 ? picturesData.map((pic, i) => (
              <PictureItem
                key={pic.id}
                picture={pic}
                isSelected={selectedPictures.includes(pic.id)}
                onPress={toggleSelect}
              />
            )) : (
              <Text className="text-center text-[#555] mt-10 w-full">
                Aucune image à valider pour le moment.
              </Text>
            )}
          </View>
        </ScrollView>

        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={handleValidate}
            disabled={selectedPictures.length === 0}
            className={`px-4 py-2 rounded-lg ${selectedPictures.length > 0 ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <Text className="text-white font-bold text-sm">Valider ({selectedPictures.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setEditModalVisible(true)} className="bg-blue-500 px-4 py-2 rounded-lg">
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

        <PvaEditModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          selectedPictures={picturesData.filter(pic => selectedPictures.includes(pic.id))}
          onConfirm={(roomId) => console.log("Modifier roomId :", roomId)}
        />
      </View>
    </Modal>
  );
};

export default PvaModal;
