import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { RoomDTO } from "@/api/DTO/room.dto";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type Props = {
  room: RoomDTO;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
};

const RoomAccordionItem = ({ room, expanded, onToggle, onEdit }: Props) => {
  return (
    <View className="mb-2 border border-gray-300 rounded-lg">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row justify-between items-center px-3 py-2 bg-gray-100"
      >
        <Text className="font-bold">{room.name}</Text>
        <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={24} />
      </TouchableOpacity>

      {expanded && (
        <View className="p-3 bg-white gap-2">
          <Text>Étage : {room.floor}</Text>
          <Text>Département : {room.departement}</Text>
          <Text>Type : {room.type}</Text>

          <TouchableOpacity
            onPress={onEdit}
            className="bg-[#007bff] px-3 py-2 rounded-md mt-3"
          >
            <Text className="text-white text-center font-bold">Modifier</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default RoomAccordionItem;
