import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import RoomLightDTO from "@/api/DTO/roomLight.dto";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";

type RoomCheckboxProps = {
  room: RoomLightDTO;
  selected: boolean;
  onToggle: (id: string) => void;
};

const RoomCheckbox: React.FC<RoomCheckboxProps> = ({ room, selected, onToggle }) => (
  <TouchableOpacity
    className="m-1 p-4 items-center justify-center"
    style={{
      backgroundColor: selected ? Colors.primary : Colors.cardBackground,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: selected ? Colors.primary : Colors.border,
      ...Shadows.sm,
    }}
    onPress={() => onToggle(room.id)}
    activeOpacity={0.8}
  >
    {selected && (
      <View className="absolute top-1 right-1">
        <MaterialIcons name="check-circle" size={20} color="white" />
      </View>
    )}
    <Text
      className="text-center font-medium"
      style={{ color: selected ? Colors.white : Colors.text }}
    >
      {room.name}
    </Text>
  </TouchableOpacity>
);

type RoomListProps = {
  rooms: RoomLightDTO[];
  selectedRooms: string[]; 
  onToggleRoom: (id: string) => void;
};

const RoomList: React.FC<RoomListProps> = ({ rooms, selectedRooms, onToggleRoom }) => (
  <View>
    <View
      className="flex-row flex-wrap justify-start p-4"
      style={{
        backgroundColor: Colors.inputBackground,
        borderRadius: BorderRadius.lg,
      }}
    >
      {rooms.map((room) => (
        <View key={room.id} className="w-1/3">
          <RoomCheckbox
            room={room}
            selected={selectedRooms.includes(room.id)}
            onToggle={onToggleRoom}
          />
        </View>
      ))}
    </View>
  </View>
);

export default RoomList;
