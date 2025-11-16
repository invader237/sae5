import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect } from "react";
import { fetchModels, scanForNewModels, setActiveModel } from "../../api/model.api";
import { ModelDTO } from "../../api/DTO/model.dto";

export default function AdminPanel() {
  const [model, setModel] = useState<string | null>(null);
  const [modelsList, setModelsList] = useState<ModelDTO[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingModel, setPendingModel] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        let models = await fetchModels();
        models = models.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));
        setModelsList(models);

        const activeModel = models.find(m => m.is_active);
        if (activeModel) setModel(activeModel.id);
      } catch (error) {
        console.error("Erreur lors de la récupération des modèles :", error);
      }
    };

    loadModels();
  }, []);

  const refreshModels = async () => {
    try {
      await scanForNewModels();
      let models = await fetchModels();
      models = models.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));
      setModelsList(models);

      const activeModel = models.find(m => m.is_active);
      if (activeModel) setModel(activeModel.id);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des modèles :", error);
    }
  };

  const handleChangeModel = (newModel: string) => {
    if (newModel !== model) {
      setPendingModel(newModel);
      setShowConfirm(true);
    }
  };

  const confirmChange = async () => {
    if (!pendingModel) return;

    try {
      await setActiveModel({ id: pendingModel } as any);

      setModel(pendingModel);
      setPendingModel(null);
      setShowConfirm(false);

      // Recharge la liste pour mettre à jour le ✔
      refreshModels();
    } catch (err) {
      console.error("Erreur lors de l'activation du modèle :", err);
    }
  };

  const cancelChange = () => {
    setPendingModel(null);
    setShowConfirm(false);
  };

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-[24px] font-bold text-[#007bff] mb-2">Panneau Admin</Text>

      <View className="bg-white p-4 border border-gray-300 rounded-lg gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-[#333] text-base">Modèle</Text>

          <TouchableOpacity
            className="bg-[#007bff] rounded-md items-center justify-center"
            onPress={refreshModels}
          >
            <Text className="text-white py-2 px-4 text-md font-semibold">
              Rafraîchir
            </Text>
          </TouchableOpacity>
        </View>

        <View className="border border-gray-300 rounded-md overflow-hidden">
          <Picker
            selectedValue={model ?? ""}
            onValueChange={handleChangeModel}
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
        onRequestClose={cancelChange}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-40">
          <View className="bg-white p-6 rounded-lg w-11/12 max-w-md">
            <Text className="text-lg font-bold mb-4">Confirmation</Text>
            <Text className="mb-6">Voulez-vous vraiment changer de modèle ?</Text>

            <View className="flex-row justify-end gap-4">
              <Pressable
                onPress={cancelChange}
                className="px-4 py-2 rounded-md bg-gray-300"
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={confirmChange}
                className="px-4 py-2 rounded-md bg-[#007bff]"
              >
                <Text className="text-white">Confirmer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
