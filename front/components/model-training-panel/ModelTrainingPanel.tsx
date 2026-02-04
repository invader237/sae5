import React, { useState } from "react";
// 1. Ajoute StyleProp et ViewStyle aux imports
import { View, Text, TouchableOpacity, TextInput, StyleProp, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ParameterLabel from "@/components/model-training-components/ParameterLabel";
import InfoModal from "@/components/model-training-components/ParameterInfoModal";
import RoomList from "@/components/model-training-components/RoomList";
import LayerSelector from "@/components/model-training-components/LayerSelector";
import { useModelTraining } from "@/hooks/models/useModelTraining";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";

const TRAINING_TYPES = {
  BASE: "base",
  SCRATCH: "scratch",
} as const;

// 2. Ajoute la prop optionnelle style ici
type RadioCardProps = {
  value: "base" | "scratch";
  title: string;
  description: string;
  style?: StyleProp<ViewStyle>;
};

const ModelTrainingPanel = () => {
  const [infoModal, setInfoModal] = useState<"epochs" | "batch" | "lr" | null>(null);
  const {
    isTraining,
    rooms,
    selectedRooms,
    trainingConfig,
    scratchLayers,
    canTrain,
    refreshRooms,
    toggleRoom,
    updateConfig,
    setTrainingType,
    toggleScratchLayer,
    train,
  } = useModelTraining();

  // 3. Récupère la prop style et applique-la dans le tableau de styles
  const RadioCard: React.FC<RadioCardProps> = ({ value, title, description, style }) => {
    const selected = trainingConfig.type === value;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setTrainingType(value)}
        className="flex-1 p-4"
        style={[
          {
            backgroundColor: selected ? Colors.primaryLight : Colors.inputBackground,
            borderRadius: BorderRadius.lg,
            borderWidth: 2,
            borderColor: selected ? Colors.primary : 'transparent',
          },
          style // On fusionne le style externe ici (il écrasera les propriétés précédentes si conflit)
        ]}
      >
        <View className="flex-row items-center">
          <View
            className="mr-3 items-center justify-center"
            style={{
              width: 22,
              height: 22,
              borderRadius: BorderRadius.full,
              borderWidth: 2,
              borderColor: selected ? Colors.primary : Colors.textMuted,
            }}
          >
            {selected && (
              <View 
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: BorderRadius.full,
                  backgroundColor: Colors.primary,
                }}
              />
            )}
          </View>

          <View className="flex-1">
            <Text 
              className="font-semibold"
              style={{ color: Colors.text }}
            >
              {title}
            </Text>
            <Text 
              className="text-xs mt-0.5"
              style={{ color: Colors.textSecondary }}
            >
              {description}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ... Reste du code (return du composant principal) identique ...
  return (
    <View 
      className="p-5 gap-5"
      style={{
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        ...Shadows.md,
      }}
    >
      {/* HEADER */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text 
            className="text-xl font-bold"
            style={{ color: Colors.text }}
          >
            Entraînement d&apos;un modèle
          </Text>
        </View>

        <TouchableOpacity 
          className="flex-row items-center justify-center"
          onPress={refreshRooms}
          style={{
            backgroundColor: Colors.primary,
            borderRadius: BorderRadius.full,
            width: 44,
            height: 44,
          }}
        >
          <MaterialIcons name="refresh" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* TYPE D'ENTRAINEMENT */}
      <View>
        <Text 
          className="font-semibold mb-3"
          style={{ color: Colors.text }}
        >
          Type d&apos;entraînement
        </Text>
        <View className="flex-row gap-3">
          <RadioCard
            value={TRAINING_TYPES.BASE}
            style={{
                  borderRadius: BorderRadius.md,
                  backgroundColor: Colors.white,
                  borderWidth: 1,
                  borderColor: Colors.border,
            }}
            title="Entraînement de base"
            description="Continuer avec un modèle existant (ResNet50)"
          />
          <RadioCard
            value={TRAINING_TYPES.SCRATCH}
            style={{
                  borderRadius: BorderRadius.md,
                  backgroundColor: Colors.white,
                  borderWidth: 1,
                  borderColor: Colors.border,
            }}
            title="From scratch"
            description="Créer un modèle à zéro"
          />
        </View>
      </View>

      {/* COUCHES DU MODÈLE - Visible uniquement en mode scratch */}
      {trainingConfig.type === TRAINING_TYPES.SCRATCH && (
        <View>
          <Text className="text-base font-semibold mb-3" style={{ color: Colors.text }}>
            Architecture du modèle
          </Text>
          <LayerSelector layers={scratchLayers} onToggleLayer={toggleScratchLayer} />
        </View>
      )}

      {/* ROOMS */}
      <View>
        <Text 
          className="font-semibold mb-3"
          style={{ color: Colors.text }}
        >
          Salles disponibles
        </Text>
        <RoomList rooms={rooms} selectedRooms={selectedRooms} onToggleRoom={toggleRoom} />
      </View>

      {/* CONFIG */}
      <View>
<Text 
          className="font-semibold mb-3"
          style={{ color: Colors.text }}
        >
          Configuration de l&apos;entraînement
        </Text>
        <View 
          className="py-2 gap-4"
          style={{
            backgroundColor: Colors.inputBackground,
            borderRadius: BorderRadius.lg,
          }}
        >
          <View>
            <ParameterLabel label="Nombre d’epochs" onInfo={() => setInfoModal("epochs")} />
            <TextInput
              value={String(trainingConfig.epochs)}
              onChangeText={(v) => updateConfig("epochs", Number(v))}
              keyboardType="numeric"
              className="px-4 py-3"
              style={{
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: BorderRadius.md,
                color: Colors.text,
                fontSize: 16,
              }}
            />
          </View>

          <View>
            <ParameterLabel label="Batch size" onInfo={() => setInfoModal("batch")} />
            <TextInput
              value={String(trainingConfig.batchSize)}
              onChangeText={(v) => updateConfig("batchSize", Number(v))}
              keyboardType="numeric"
              className="px-4 py-3"
              style={{
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: BorderRadius.md,
                color: Colors.text,
                fontSize: 16,
              }}
            />
          </View>

          <View>
            <ParameterLabel label="Learning rate" onInfo={() => setInfoModal("lr")} />
            <TextInput
              value={String(trainingConfig.learningRate)}
              onChangeText={(v) => updateConfig("learningRate", Number(v))}
              keyboardType="decimal-pad"
              className="px-4 py-3"
              style={{
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: BorderRadius.md,
                color: Colors.text,
                fontSize: 16,
              }}
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

      {/* MESSAGE D'ERREUR SI AUCUNE COUCHE */}
      {trainingConfig.type === "scratch" && !canTrain && (
        <View
          className="rounded-lg p-3 flex-row items-center"
          style={{
            backgroundColor: Colors.dangerLight,
            borderWidth: 1,
            borderColor: Colors.danger,
          }}
        >
          <MaterialIcons name="error-outline" size={20} color={Colors.danger} />
          <Text className="ml-2 flex-1" style={{ color: Colors.danger }}>
            Veuillez sélectionner au moins une couche pour l&apos;entraînement from scratch.
          </Text>
        </View>
      )}

      {/* ACTION */}
<TouchableOpacity
  disabled={isTraining || !canTrain}
  onPress={train}
  // AJOUT ICI : flex-row (ligne), items-center (centré vertical), justify-center (centré horizontal)
  className="px-4 py-3 rounded-md flex-row items-center justify-center"
  style={{
    backgroundColor: isTraining || !canTrain ? Colors.border : Colors.primary,
    opacity: isTraining || !canTrain ? 0.7 : 1,
  }}
>
  <MaterialIcons 
    name={isTraining ? "hourglass-empty" : "play-arrow"} 
    size={22} 
    color={Colors.onPrimary} // Assure-toi que c'est bien blanc (ou contrasté)
  />
  <Text className="font-bold text-base ml-2" style={{ color: Colors.onPrimary }}>
    {isTraining ? "Entraînement en cours..." : "Lancer l’entraînement"}
  </Text>
</TouchableOpacity>
    </View>
  );
};

export default ModelTrainingPanel;
