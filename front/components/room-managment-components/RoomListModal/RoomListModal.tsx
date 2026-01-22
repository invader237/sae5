import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import RoomDTO from "@/api/DTO/room.dto";
import RoomAccordionItem from "@/components/room-managment-components/RoomAccordionItem";
import { useRoomListModal } from "@/hooks/rooms/useRoomListModal";

type Props = {
  visible: boolean;
  rooms: RoomDTO[];
  onClose: () => void;
  onEdit: (room: RoomDTO) => void;
  onViewPictures: (room: RoomDTO) => void;
};

const RoomListModal = (
  { visible, rooms, onClose, onEdit, onViewPictures }: Props
) => {
  const { expandedRoom, sortedRooms, toggleExpanded } = useRoomListModal({ rooms });

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-11/12 bg-white p-5 rounded-lg border border-gray-300 max-h-[500px]">
          <Text className="text-lg font-bold mb-3 text-[#333]">
            Salles existantes
          </Text>

          <ScrollView className="max-h-[400px]">
            {sortedRooms.map((room) => (
              <RoomAccordionItem
                key={room.id}
                room={room}
                expanded={expandedRoom === room.id}
                onToggle={() => toggleExpanded(room.id)}
                onEdit={() => onEdit(room)}
                onViewPictures={() => onViewPictures(room)}
              />
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            className="mt-4 px-4 py-2 rounded-md bg-[#007bff]"
          >
            <Text className="text-white font-bold text-center">Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default RoomListModal;
