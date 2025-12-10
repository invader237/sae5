import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { RoomDTO } from "@/api/DTO/room.dto";
import RoomAccordionItem from "@/components/room-managment-components/RoomAccordionItem";

type Props = {
  visible: boolean;
  rooms: RoomDTO[];
  onClose: () => void;
  onEdit: (room: RoomDTO) => void;
};

const RoomListModal = ({ visible, rooms, onClose, onEdit }: Props) => {
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-11/12 bg-white p-5 rounded-lg border border-gray-300 max-h-[500px]">
          <Text className="text-lg font-bold mb-3 text-[#333]">Salles existantes</Text>

          <ScrollView className="max-h-[400px]">
            {rooms.map((room) => (
              <RoomAccordionItem
                key={room.id}
                room={room}
                expanded={expandedRoom === room.id}
                onToggle={() =>
                  setExpandedRoom(expandedRoom === room.id ? null : room.id)
                }
                onEdit={() => onEdit(room)}
              />
            ))}
          </ScrollView>

          <TouchableOpacity onPress={onClose} className="mt-4 px-4 py-2 rounded-md bg-[#007bff]">
            <Text className="text-white font-bold text-center">Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default RoomListModal;
