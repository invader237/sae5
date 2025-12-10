import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { fetchToValidatePictures } from "@/api/picture.api";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";
import PvaModal from "@/components/pva-components/PvaModal";
import PictureItem from "@/components/pva-components/PvaPictureItem";

const PvaPanel = () => {
  const [picturesPvaData, setPicturesPvaData] = useState<PicturePvaDTO[]>([]);
  const [pvaModalIsVisible, setPvaModalIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPictures = async () => {
    setIsRefreshing(true);
    try {
      const pics = await fetchToValidatePictures();
      setPicturesPvaData(pics);
    } catch (e) {
      console.error("Erreur rafraîchissement PVA :", e);
      alert("Impossible de récupérer les images. Veuillez réessayer plus tard.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchPictures(); }, []);

  const previewPictures = picturesPvaData.slice(0, 5);

  const handleValidated = (validatedIds: string[]) => {
    setPicturesPvaData(prev => prev.filter(pic => !validatedIds.includes(pic.id)));
  };

  return (
    <View className="bg-white p-4 border border-gray-300 rounded-lg gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-[#333] text-lg font-bold">Pré-validation</Text>
        <TouchableOpacity onPress={fetchPictures} disabled={isRefreshing} className="bg-[#007bff] rounded-md flex-row items-center justify-center px-4 py-2">
          <MaterialIcons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ flexDirection: "row" }} className="px-3">
        {previewPictures.length > 0 ? previewPictures.map((pic, i) => (
          <View key={pic.id} className="mr-3">
            <PictureItem picture={pic} />
          </View>
        )) : (
          <View className="w-[150px] h-[150px] border border-gray-300 rounded-lg mr-3 flex items-center justify-center">
            <Text className="text-center">Aucune image à valider</Text>
          </View>
        )}
        <TouchableOpacity onPress={() => setPvaModalIsVisible(true)} className="w-[150px] h-[150px] flex items-center justify-center rounded-lg">
          <Text className="text-blue-500 underline">Voir plus...</Text>
        </TouchableOpacity>
      </ScrollView>

      <PvaModal
        visible={pvaModalIsVisible}
        onClose={() => setPvaModalIsVisible(false)}
        picturesData={picturesPvaData}
        onValidated={handleValidated}
        onDeleted={(deletedIds: string[]) => setPicturesPvaData(prev => prev.filter(pic => !deletedIds.includes(pic.id)))}
      />
    </View>
  );
};

export default PvaPanel;
