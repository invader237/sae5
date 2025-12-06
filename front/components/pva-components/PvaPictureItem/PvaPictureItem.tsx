import React, { memo, useEffect, useState } from "react";
import { TouchableOpacity, Image, View, Text } from "react-native";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";

interface Props {
  picture: PicturePvaDTO;
  size?: number;
  isSelected?: boolean;
  onPress?: (id: string) => void;
}

// --- Cache en mémoire intelligent ---
const MAX_CACHE = 50;
const imageCache: Record<string, string> = {};
const cacheOrder: string[] = []; 

const addToCache = (id: string, data: string) => {
  if (!imageCache[id]) {
    if (cacheOrder.length >= MAX_CACHE) {
      const oldestId = cacheOrder.shift(); 
      if (oldestId) delete imageCache[oldestId];
    }
    cacheOrder.push(id);
  }
  imageCache[id] = data;
};

const PvaPictureItem = memo(function PictureItem({ picture, size = 150, isSelected, onPress }: Props) {
  const [uri, setUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchImage = async () => {
      if (imageCache[picture.id]) {
        setUri(imageCache[picture.id]);
      } else {
        try {
          const response = await fetch(
            `http://localhost:8000/pictures/${picture.id}/recover?type=thumbnail`
          );
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            addToCache(picture.id, dataUrl); // ajout au cache intelligent
            setUri(dataUrl);
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          console.error("Erreur chargement image :", e);
        }
      }
    };
    fetchImage();
  }, [picture.id]);

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
          {picture.recognition_percentage?.toFixed(2)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default PvaPictureItem;
