import React from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { RoomDTO } from "@/api/DTO/room.dto";
import { useRoomSelector } from "@/hooks/rooms/useRoomSelector";

type RoomSelectorProps = {
  onSelectRoom: (room: RoomDTO | null) => void;
};

export default function RoomSelector({ onSelectRoom }: RoomSelectorProps) {
  const { rooms, selectedId, handleSelect } = useRoomSelector({ onSelectRoom });

  return (
    <View className="gap-2">
      <Text className="font-medium">Select a room</Text>

      <Picker
        selectedValue={selectedId}
        onValueChange={handleSelect}
        style={{ backgroundColor: "#eaeaea" }}
      >
        <Picker.Item label="Choose a room..." value="" />
        {rooms.map((r) => (
          <Picker.Item key={r.id} label={`${r.name} (Floor ${r.floor})`} value={r.id} />
        ))}
      </Picker>
    </View>
  );
}
