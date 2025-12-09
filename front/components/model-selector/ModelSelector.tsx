import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ModelDTO } from "../../api/DTO/model.dto";

type Props = {
  model: string | null;
  modelsList: ModelDTO[];
  onRefresh: () => void;
  onConfirmChange: (newModel: string) => void;
};

export default function ModelSelector({
  model,
  modelsList,
  onRefresh,
  onConfirmChange,
}: Props) {
  const [pendingModel, setPendingModel] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSelect = (newModel: string) => {
    if (newModel !== model) {
      setPendingModel(newModel);
      setShowConfirm(true);
    }
  };

  const confirm = () => {
    if (!pendingModel) return;
    onConfirmChange(pendingModel);
    setShowConfirm(false);
    setPendingModel(null);
  };

  return (
    <>
      <View className="bg-white p-4 border border-gray-300 rounded-lg gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-[#333] text-lg font-bold">Modèle</Text>

          <TouchableOpacity
            onPress={onRefresh}
            className="bg-[#007bff] rounded-md flex-row items-center justify-center px-4 py-2"
          >
            <MaterialIcons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="border border-gray-300 rounded-md overflow-hidden">
          <Picker
            selectedValue={model ?? ""}
            onValueChange={handleSelect}
            className="h-12 mx-2"
          >
            {modelsList.map((m) => (
              <Picker.Item
                key={m.id}
                value={m.id}
                label={`${m.is_active ? "✔ " : ""}${m.name}`}
              />
            ))}
          </Picker>
        </View>

        <Text className="text-[#333] text-base">
          Sélectionnez un modèle dans la liste déroulante ci-dessus.
        </Text>
      </View>

      {/* Modal de confirmation */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-40">
          <View className="bg-white p-6 rounded-lg w-11/12 max-w-md">
            <Text className="text-lg font-bold mb-4">Confirmation</Text>
            <Text className="mb-6">Voulez-vous vraiment changer de modèle ?</Text>

            <View className="flex-row justify-end gap-4">
              <Pressable
                onPress={() => {
                  setPendingModel(null);
                  setShowConfirm(false);
                }}
                className="px-4 py-2 rounded-md bg-gray-300"
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={confirm}
                className="px-4 py-2 rounded-md bg-[#007bff]"
              >
                <Text className="text-white">Confirmer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
