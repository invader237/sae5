import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { RoomDTO } from "@/api/DTO/room.dto";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ProgressBar from "@/components/ProgressBar";

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
        className="flex-row items-center px-3 py-2 bg-gray-100"
      >
        <View className="flex-1">
          <View className="flex-row justify-between items-center">
            <Text className="font-bold">{room.name}</Text>
            <Text className="text-sm text-gray-600">
              {room.validated_picture_count} / 500
            </Text>
          </View>

          <View className="mt-1">
            <ProgressBar
              value={room.validated_picture_count ?? 0}
              threshold={90}
              max={500}
              width="100%"
            />
          </View>
        </View>

        <MaterialIcons
          name={expanded ? "expand-less" : "expand-more"}
          size={24}
          style={{ marginLeft: 8 }}
        />
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
