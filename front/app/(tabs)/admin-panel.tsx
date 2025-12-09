import { View, Text } from "react-native";
import { useState, useEffect } from "react";
import { fetchModels, scanForNewModels, setActiveModel } from "../../api/model.api";
import ModelDTO from "../../api/DTO/model.dto";
import ModelSelector from "../../components/model-selector";
import PvaPanel from "../../components/pva-panel";

export default function AdminPanel() {
  const [model, setModel] = useState<string | null>(null);
  const [modelsList, setModelsList] = useState<ModelDTO[]>([]);

  useEffect(() => {
    const loadModels = async () => {
      let models = await fetchModels();
      models = models.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));
      setModelsList(models);

      const activeModel = models.find(m => m.is_active);
      if (activeModel) setModel(activeModel.id);
    };

    loadModels();
  }, []);

  const refreshModels = async () => {
    await scanForNewModels();

    let models = await fetchModels();
    models = models.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));
    setModelsList(models);

    const activeModel = models.find(m => m.is_active);
    if (activeModel) setModel(activeModel.id);
  };

  const handleConfirmModelChange = async (newModel: string) => {
    await setActiveModel({ id: newModel } as any);
    setModel(newModel);
    refreshModels();
  };

  return (
    <View className="flex-1 bg-white p-6 gap-4">
      <Text className="text-[24px] font-bold text-[#007bff]">Panneau Admin</Text>

      <ModelSelector
        model={model}
        modelsList={modelsList}
        onRefresh={refreshModels}
        onConfirmChange={handleConfirmModelChange}
      />

      <PvaPanel />
    </View>
  );
}
