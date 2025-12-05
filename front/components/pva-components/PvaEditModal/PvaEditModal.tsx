import React, { useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { fetchRoomsForPva } from "@/api/room.api";
import RoomLightDTO from "@/api/DTO/roomLight.dto";

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedPictures: any[];
  onConfirm?: (roomId: string | null) => void;
}

const PvaEditModal = ({ visible, onClose, selectedPictures, onConfirm }: Props) => {
  const [rooms, setRooms] = useState<RoomLightDTO[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await fetchRoomsForPva();
        setRooms(data);
        if (data.length > 0) setSelectedRoomId(data[0].id);
      } catch (e) {
        console.error('Erreur récupération des salles :', e);
      }
    };
    fetchRooms();
  }, []);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
            onPress={() => { onConfirm?.(selectedRoomId); onClose(); }}
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
