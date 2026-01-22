import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";
import { usePvaEditModal } from "@/hooks/pva/usePvaEditModal";

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedPictures: PicturePvaDTO[];
  onUpdated?: () => Promise<void> | void;
}

const PvaEditModal = ({
  visible,
  onClose,
  selectedPictures,
  onUpdated,
}: Props) => {
  const { rooms, selectedRoomId, setSelectedRoomId, handleConfirm } = usePvaEditModal({
    visible,
    selectedPictures,
    onUpdated,
    onClose,
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-lg p-6 w-80">
          <Text className="text-lg font-bold mb-4">Modifier les images</Text>
          <Text className="text-sm text-gray-600 mb-4">
            {selectedPictures.length} image(s) sélectionnée(s)
          </Text>

          <Picker
            selectedValue={selectedRoomId}
            onValueChange={(itemValue) => setSelectedRoomId(itemValue)}
            className="mb-4"
          >
            {rooms.map((room) => (
              <Picker.Item key={room.id} label={room.name} value={room.id} />
            ))}
          </Picker>

          <TouchableOpacity
            onPress={handleConfirm}
            className="bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-bold text-center">Valider</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="mt-2 px-4 py-2 rounded-lg border border-gray-300"
          >
            <Text className="text-center font-semibold">Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PvaEditModal;
