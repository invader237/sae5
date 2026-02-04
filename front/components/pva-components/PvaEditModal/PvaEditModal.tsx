import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";
import { usePvaEditModal } from "@/hooks/pva/usePvaEditModal";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";

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
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: Colors.overlay }}
      >
        <View
          className="p-6 w-80"
          style={{
            backgroundColor: Colors.cardBackground,
            borderRadius: BorderRadius.lg,
            ...Shadows.md,
          }}
        >
          <Text className="text-lg font-bold mb-4" style={{ color: Colors.text }}>
            Modifier les images
          </Text>
          <Text className="text-sm mb-4" style={{ color: Colors.textSecondary }}>
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
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: Colors.primary,
              borderRadius: BorderRadius.md,
            }}
          >
            <Text className="font-bold text-center" style={{ color: Colors.onPrimary }}>
              Valider
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="mt-2 px-4 py-2 rounded-lg"
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: BorderRadius.md,
            }}
          >
            <Text className="text-center font-semibold" style={{ color: Colors.textSecondary }}>
              Annuler
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PvaEditModal;
