import React, { memo } from "react";
import { TouchableOpacity, Image, View, Text } from "react-native";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";

interface Props {
  picture: PicturePvaDTO;
  index?: number;
  size?: number;
  isSelected?: boolean;
  onPress?: (id: string) => void;
}

const PvaPictureItem = memo(function PictureItem({ picture, size = 150, isSelected, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={() => onPress?.(picture.id)}
      activeOpacity={0.8}
      className={`relative rounded-xl ${isSelected ? "border-4 border-blue-500" : ""}`}
      style={{ width: size, height: size }}
    >
      <Image
        source={{
          uri: `http://localhost:8000/pictures/${picture.id}/recover?type=thumbnail`,
        }}
        className="w-full h-full rounded-lg"
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
        <Text className="text-white font-bold text-center text-base">{picture?.room?.name}</Text>
        <Text className="text-white text-sm font-semibold mt-1 text-center">
          {picture.recognition_percentage?.toFixed(2)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default PvaPictureItem;
