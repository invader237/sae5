import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getRooms } from "@/api/room.api";
import { RoomDTO } from "@/api/DTO/room.dto";

export default function RoomSelector({ onSelectRoom }) {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    getRooms().then(setRooms);
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const room = rooms.find((r) => r.id === id);
    onSelectRoom(room || null);
  };

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
