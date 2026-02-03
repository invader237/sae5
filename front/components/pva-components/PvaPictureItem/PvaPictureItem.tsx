import React, { memo } from "react";
import { TouchableOpacity, Image, View, Text } from "react-native";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";
import { usePvaThumbnail } from "@/hooks/pva/usePvaThumbnail";

interface Props {
  picture: PicturePvaDTO;
  size?: number;
  isSelected?: boolean;
  onPress?: (id: string) => void;
}

const PvaPictureItem = memo(function PictureItem({ picture, size = 150, isSelected, onPress }: Props) {
  const { uri } = usePvaThumbnail(picture.id);

  return (
    <TouchableOpacity
      onPress={() => onPress?.(picture.id)}
      activeOpacity={0.8}
      className={`
        overflow-hidden m-1
        ${isSelected ? "border-4 border-blue-500" : "border-0"}
      `}
      style={{
        width: size,
        height: size,
        borderRadius: 12, 
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="flex-1 bg-gray-200" />
      )}

      <View
        className="
          absolute inset-0 bg-black/40
          justify-center items-center
        "
      >
        <Text className="text-white font-bold text-center">
          {picture?.room?.name}
        </Text>
        <Text className="text-white text-xs mt-0.5">
          {picture?.recognition_percentage
            ? `${(picture.recognition_percentage * 100).toFixed(1)}%`
            : "Inconnu"}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default PvaPictureItem;
