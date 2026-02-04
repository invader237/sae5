import React, { memo } from "react";
import { TouchableOpacity, Image, View, Text } from "react-native";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";
import { usePvaThumbnail } from "@/hooks/pva/usePvaThumbnail";
import { Colors, BorderRadius } from "@/constants/theme";

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
      className="overflow-hidden m-1"
      style={{
        width: size,
        height: size,
        borderRadius: BorderRadius.md,
        borderWidth: isSelected ? 3 : 0,
        borderColor: isSelected ? Colors.info : "transparent",
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="flex-1" style={{ backgroundColor: Colors.inputBackground }} />
      )}

      <View
        className="absolute inset-0 justify-center items-center"
        style={{ backgroundColor: Colors.overlaySoft }}
      >
        <Text className="font-bold text-center" style={{ color: Colors.textInverted }}>
          {picture?.room?.name}
        </Text>
        <Text className="text-xs mt-0.5" style={{ color: Colors.textInverted }}>
          {picture?.recognition_percentage
            ? `${(picture.recognition_percentage * 100).toFixed(1)}%`
            : "Inconnu"}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default PvaPictureItem;
