import React, { useEffect, useState, memo } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Modal } from "react-native";
import { fetchToValidatePictures, validatePictures } from "@/api/picture.api";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";

/* ---------------------------------------------------------------------- */
/*  Composant Image avec sélection                                        */
/* ---------------------------------------------------------------------- */
const PictureItem = memo(function PictureItem({ picture, index, size = 150, isSelected, onPress }) {
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

      {/* Overlay */}
      <View className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
        <Text className="text-white font-bold text-center text-base">
          {picture?.room?.name}
        </Text>
        <Text className="text-white text-sm font-semibold mt-1 text-center">
          {picture.recognition_percentage?.toFixed(2)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
});

/* ---------------------------------------------------------------------- */
/*  Modal avec sélection multiple                                         */
/* ---------------------------------------------------------------------- */
const PvaModal = ({ visible, onClose, picturesData, onValidated }) => {
  const [selectedPictures, setSelectedPictures] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedPictures(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const handleValidate = async () => {
    try {
      const picturesToValidate = picturesData.filter(pic => selectedPictures.includes(pic.id));
      await validatePictures(picturesToValidate);
      onValidated?.(selectedPictures); // callback vers le parent pour maj UI
      setSelectedPictures([]); // reset sélection
      onClose();
    } catch (error) {
      console.error("Erreur lors de la validation :", error);
    }
  };

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-white p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-[#333]">Toutes les images à valider</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-500 text-lg">Fermer</Text>
          </TouchableOpacity>
        </View>

        {/* Images */}
        <ScrollView className="flex-1 px-2">
          <View className="flex-row flex-wrap justify-center gap-4 mb-4">
            {picturesData.length > 0 ? (
              picturesData.map((pic, i) => (
                <PictureItem
                  key={pic.id}
                  picture={pic}
                  index={i}
                  isSelected={selectedPictures.includes(pic.id)}
                  onPress={toggleSelect}
                />
              ))
            ) : (
              <Text className="text-center text-[#555] mt-10 w-full">
                Aucune image à valider pour le moment.
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Boutons */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={handleValidate}
            disabled={selectedPictures.length === 0}
            className={`px-4 py-2 rounded-lg ${selectedPictures.length > 0 ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <Text className="text-white font-bold text-sm">
              Valider ({selectedPictures.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => console.log("Modifier →", selectedPictures)}
            className="bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-bold text-sm">Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => console.log("Supprimer →", selectedPictures)}
            className="bg-red-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-bold text-sm">Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/* ---------------------------------------------------------------------- */
/*  Panneau principal                                                     */
/* ---------------------------------------------------------------------- */
function PvaPanel() {
  const [picturesPvaData, setPicturesPvaData] = useState<PicturePvaDTO[]>([]);
  const [pvaModalIsVisible, setPvaModalIsVisible] = useState(false);

  useEffect(() => {
    fetchToValidatePictures()
      .then(setPicturesPvaData)
      .catch((e) => console.error("Erreur récupération PVA :", e));
  }, []);

  const previewPictures = picturesPvaData.slice(0, 5);

  const handleValidated = (validatedIds: string[]) => {
    setPicturesPvaData(prev => prev.filter(pic => !validatedIds.includes(pic.id)));
  };

  return (
    <View className="bg-white p-4 border border-gray-300 rounded-lg gap-4">
      <Text className="text-[#333] text-lg font-bold">Pré-validation</Text>

      {/* Preview horizontal */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={{ flexDirection: "row" }}
        className="px-3"
      >
        {previewPictures.length > 0 ? (
          previewPictures.map((pic, i) => (
            <View key={pic.id} className="mr-3">
              <PictureItem picture={pic} index={i} />
            </View>
          ))
        ) : (
          <View className="w-[150px] h-[150px] border border-gray-300 rounded-lg mr-3 flex items-center justify-center">
            <Text className="text-center">Aucune image à valider</Text>
          </View>
        )}

        {/* Bouton voir plus */}
        <TouchableOpacity
          onPress={() => setPvaModalIsVisible(true)}
          className="w-[150px] h-[150px] flex items-center justify-center rounded-lg"
        >
          <Text className="text-blue-500 underline">Voir plus...</Text>
        </TouchableOpacity>
      </ScrollView>

      <Text className="text-[#555] text-sm">
        Le système de pré-validation administrateur (PVA) est en cours de développement et sera bientôt disponible.
      </Text>

      {/* Modal */}
      <PvaModal
        visible={pvaModalIsVisible}
        onClose={() => setPvaModalIsVisible(false)}
        picturesData={picturesPvaData}
        onValidated={handleValidated}
      />
    </View>
  );
}

export default PvaPanel;
