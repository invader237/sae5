import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal } from 'react-native'; 
import { fetchToValidatePictures, fetchPicture } from '@/api/picture.api';
import PicturePvaDTO from '@/api/DTO/picturePva.dto';

const PvaModal = ({ visible, onClose, picturesData }) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white p-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-[#333]">
            Toutes les images à valider
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-500 text-lg">Fermer</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4">
          <View className="flex-row flex-wrap justify-between gap-3">
            {picturesData.map((picture, index) => (
              <Image
                key={index}
                source={{ uri: `http://localhost:8000/pictures/${picture.id}/recover?type=full` }}
                className="w-[48%] h-40 rounded-lg"
                resizeMode="cover"
                onError={(e) => {
                  e.nativeEvent.target.setNativeProps({ src: [{ uri: `https://placehold.co/300x300?text=PVA+${index + 1}` }] });
                }}
              />
            ))}

            {picturesData.length === 0 && (
              <Text className="text-center text-[#555] mt-10 w-full">
                Aucune image à valider pour le moment.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

function PvaPanel() {
  const [picturesPvaData, setPicturesPvaData] = useState<PicturePvaDTO[]>([]);
  const [pvaModalIsVisible, setPvaModalIsVisible] = useState(false);

  useEffect(() => {
    const loadPicturesToValidate = async () => {
      try {
        const pictures = await fetchToValidatePictures();
        setPicturesPvaData(pictures);
      } catch (error) {
        console.error("Erreur lors de la récupération des images à valider :", error);
      }
    };

    loadPicturesToValidate();
  }, []);

  const imagesContent = picturesPvaData.slice(0,5).map((picture, index) => (
    <View className="relative w-[150] h-[150] mr-2.5">
        <Image
            key={picture.id || index} 
            source={{ uri: `http://localhost:8000/pictures/${picture.id}/recover?type=thumbnail` }}
            style={{ width: 150, height: 150, borderRadius: 8, marginRight: 8 }}
            resizeMode="cover"
            onError={(e) => {
              e.nativeEvent.target.setNativeProps({ src: [{ uri: `https://placehold.co/150x150?text=PVA+${index+1}` }] });
            }}
        />
        
        <View className="absolute inset-0 flex justify-center items-center bg-with bg-opacity-1"> 
            <Text className="text-center text-md text-white font-bold">
                {picture.room.name}
            </Text>
            <Text className="text-center text-md text-white font-bold">
                {picture.recognition_percentage?.toFixed(2)}%
            </Text>
        </View>
    </View>
  ));

  const emptyContent = (
    <View style={{ width: 150, height: 150, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginRight: 10 }}>
        <Text style={{ textAlign: 'center' }}>Aucune image à valider</Text>
    </View>
  );

  return (
    <View className="bg-white p-4 border border-gray-300 rounded-lg gap-4">
      
      <View className="flex-row items-center justify-between">
        <Text className="text-[#333] text-lg font-bold">Près validation</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{ paddingHorizontal: 10, flexDirection: 'row' }} 
      >
        {picturesPvaData.length > 0 ? imagesContent : emptyContent}
        <TouchableOpacity
          onPress={() => setPvaModalIsVisible(true)}
          className="justify-center items-center rounded-lg"
          style={{ width: 150, height: 150 }}
        >
          <Text className="text-blue-500 underline">Voir plus...</Text>
        </TouchableOpacity>

      </ScrollView>

      <Text className="text-[#555] text-sm">
        Le système de pré-validation administrateur (PVA) est en cours de développement et sera bientôt disponible.
      </Text>

      <PvaModal
        visible={pvaModalIsVisible}
        onClose={() => setPvaModalIsVisible(false)}
        picturesData={picturesPvaData} 
      />
    </View>
  );
}

export default PvaPanel;
