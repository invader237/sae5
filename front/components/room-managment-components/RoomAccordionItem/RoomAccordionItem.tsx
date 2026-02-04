import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import RoomDTO from "@/api/DTO/room.dto";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ProgressBar from "@/components/ProgressBar";
import { Colors, BorderRadius } from "@/constants/theme";

type Props = {
  room: RoomDTO;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onViewPictures: () => void;
};

const RoomAccordionItem = (
  { room, expanded, onToggle, onEdit, onViewPictures }: Props
) => {
  return (
    <View
      className="mb-2"
      style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg }}
    >
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center px-3 py-2"
        style={{ backgroundColor: Colors.inputBackground }}
      >
        <View className="flex-1">
          <View className="flex-row justify-between items-center">
            <Text className="font-bold" style={{ color: Colors.text }}>
              {room.name}
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary }}>
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
          color={Colors.textMuted}
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>

      {expanded && (
        <View className="p-3 gap-2" style={{ backgroundColor: Colors.cardBackground }}>
          <Text style={{ color: Colors.text }}>Étage : {room.floor}</Text>
          <Text style={{ color: Colors.text }}>Département : {room.departement}</Text>
          <Text style={{ color: Colors.text }}>Type : {room.type}</Text>

          <View className="flex-row gap-2 mt-3">
            <TouchableOpacity
              onPress={onEdit}
              className="px-3 py-2 flex-1"
              style={{
                backgroundColor: Colors.primary,
                borderRadius: BorderRadius.md,
              }}
            >
              <Text className="text-center font-bold" style={{ color: Colors.onPrimary }}>
                Modifier
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onViewPictures}
              className="px-3 py-2 flex-1"
              style={{
                backgroundColor: Colors.textSecondary,
                borderRadius: BorderRadius.md,
              }}
            >
              <Text className="text-center font-bold" style={{ color: Colors.onPrimary }}>
                Voir les images
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default RoomAccordionItem;
