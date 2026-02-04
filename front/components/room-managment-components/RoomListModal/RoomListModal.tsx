import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import RoomDTO from "@/api/DTO/room.dto";
import RoomAccordionItem from "@/components/room-managment-components/RoomAccordionItem";
import { useRoomListModal } from "@/hooks/rooms/useRoomListModal";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";

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
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: Colors.overlay }}
      >
        <View
          className="w-11/12 p-5 max-h-[500px]"
          style={{
            backgroundColor: Colors.cardBackground,
            borderRadius: BorderRadius.lg,
            ...Shadows.md,
          }}
        >
          <Text className="text-lg font-bold mb-3" style={{ color: Colors.text }}>
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
            className="mt-4 px-4 py-2 rounded-md"
            style={{
              backgroundColor: Colors.primary,
              borderRadius: BorderRadius.md,
            }}
          >
            <Text className="font-bold text-center" style={{ color: Colors.onPrimary }}>
              Fermer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default RoomListModal;
