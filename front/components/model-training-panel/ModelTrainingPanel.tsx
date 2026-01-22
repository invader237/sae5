import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ParameterLabel from "@/components/model-training-components/ParameterLabel";
import InfoModal from "@/components/model-training-components/ParameterInfoModal";
import RoomList from "@/components/model-training-components/RoomList";
import { useModelTraining } from "@/hooks/models/useModelTraining";

const TRAINING_TYPES = {
  BASE: "base",
  SCRATCH: "scratch",
} as const;

type RadioCardProps = {
  value: "base" | "scratch";
  title: string;
  description: string;
};

const ModelTrainingPanel = () => {
  const [infoModal, setInfoModal] = useState<"epochs" | "batch" | "lr" | null>(null);
  const {
    isTraining,
    rooms,
    selectedRooms,
    trainingConfig,
    refreshRooms,
    toggleRoom,
    updateConfig,
    setTrainingType,
    train,
  } = useModelTraining();

  const RadioCard: React.FC<RadioCardProps> = ({ value, title, description }) => {
    const selected = trainingConfig.type === value;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setTrainingType(value)}
        className={`flex-1 p-4 rounded-xl border-2 ${
          selected ? "border-[#007bff] bg-blue-50" : "border-gray-300 bg-white"
        }`}
      >
        <View className="flex-row items-center">
          <View
            className={`w-5 h-5 border-2 rounded-full mr-3 items-center justify-center ${
              selected ? "border-[#007bff]" : "border-gray-400"
            }`}
          >
            {selected && <View className="w-3 h-3 bg-[#007bff] rounded-full" />}
          </View>

          <View className="flex-1">
            <Text className="font-semibold text-gray-800">{title}</Text>
            <Text className="text-xs text-gray-500 mt-0.5">{description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-white p-4 border border-gray-300 rounded-lg gap-4">
      {/* HEADER */}
      <View className="flex-row items-center justify-between">
        <Text className="text-[#333] text-lg font-bold">Entraînement d’un modèle</Text>

        <TouchableOpacity className="bg-[#007bff] rounded-md px-3 py-2" onPress={refreshRooms}>
          <MaterialIcons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* TYPE D'ENTRAINEMENT */}
      <View>
        <Text className="text-base font-semibold text-gray-800 mb-3">Type d’entraînement</Text>
        <View className="flex-row gap-3">
          <RadioCard
            value={TRAINING_TYPES.BASE}
            title="Entraînement de base"
            description="Continuer avec un modèle existant (ResNet50)"
          />
          <RadioCard
            value={TRAINING_TYPES.SCRATCH}
            title="From scratch"
            description="Créer un modèle à zéro (en cours de développement)"
          />
        </View>
      </View>

      {/* ROOMS */}
      <Text className="text-base font-semibold text-gray-800">Salles disponibles</Text>
      <RoomList rooms={rooms} selectedRooms={selectedRooms} onToggleRoom={toggleRoom} />

      {/* CONFIG */}
      <View>
        <Text className="text-base font-semibold text-gray-800 mb-3">Configuration de l’entraînement</Text>
        <View className="p-4 bg-gray-100 rounded-xl gap-4">
          <View>
            <ParameterLabel label="Nombre d’epochs" onInfo={() => setInfoModal("epochs")} />
            <TextInput
              value={String(trainingConfig.epochs)}
              onChangeText={(v) => updateConfig("epochs", Number(v))}
              keyboardType="numeric"
              className="bg-white border border-gray-300 rounded-md px-3 py-2"
            />
          </View>

          <View>
            <ParameterLabel label="Batch size" onInfo={() => setInfoModal("batch")} />
            <TextInput
              value={String(trainingConfig.batchSize)}
              onChangeText={(v) => updateConfig("batchSize", Number(v))}
              keyboardType="numeric"
              className="bg-white border border-gray-300 rounded-md px-3 py-2"
            />
          </View>

          <View>
            <ParameterLabel label="Learning rate" onInfo={() => setInfoModal("lr")} />
            <TextInput
              value={String(trainingConfig.learningRate)}
              onChangeText={(v) => updateConfig("learningRate", Number(v))}
              keyboardType="decimal-pad"
              className="bg-white border border-gray-300 rounded-md px-3 py-2"
            />
          </View>
        </View>
      </View>

      {/* INFO MODALS */}
      <InfoModal
        visible={infoModal === "epochs"}
        onClose={() => setInfoModal(null)}
        title="Nombre d’epochs"
        description="Une epoch correspond à un passage complet de l’ensemble des données d’entraînement."
        increase="Le modèle apprend davantage mais le risque de sur-apprentissage augmente."
        decrease="L’entraînement est plus rapide mais peut être insuffisant pour bien apprendre."
      />
      <InfoModal
        visible={infoModal === "batch"}
        onClose={() => setInfoModal(null)}
        title="Batch size"
        description="Le batch size définit le nombre d’échantillons utilisés pour calculer une mise à jour du modèle."
        increase="Entraînement plus stable et rapide, mais nécessite plus de mémoire."
        decrease="Moins de mémoire requise mais apprentissage plus bruité."
      />
      <InfoModal
        visible={infoModal === "lr"}
        onClose={() => setInfoModal(null)}
        title="Learning rate"
        description="Le learning rate contrôle l’amplitude des ajustements des poids du modèle."
        increase="Apprentissage plus rapide mais risque de divergence."
        decrease="Apprentissage plus lent mais plus stable."
      />

      {/* ACTION */}
      <TouchableOpacity
        disabled={isTraining}
        onPress={train}
        className={`px-4 py-3 rounded-md ${isTraining ? "bg-gray-400" : "bg-[#28a745]"}`}
      >
        <Text className="text-white font-bold text-center">
          {isTraining ? "Entraînement en cours..." : "Lancer l’entraînement"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ModelTrainingPanel;
