import { useCallback, useEffect, useState } from "react";
import { fetchModels, scanForNewModels, setActiveModel } from "@/api/model.api";
import ModelDTO from "@/api/DTO/model.dto";

export function useModelSelector() {
  const [model, setModel] = useState<string | null>(null);
  const [modelsList, setModelsList] = useState<ModelDTO[]>([]);
  const [pendingModel, setPendingModel] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadModels = useCallback(async () => {
    let models = await fetchModels();
    models = models.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));
    setModelsList(models);

    const active = models.find((m) => m.is_active);
    if (active) setModel(active.id);
  }, []);

  const refreshModels = useCallback(async () => {
    await scanForNewModels();
    await loadModels();
  }, [loadModels]);

  const handleConfirmChange = useCallback(async (newModel: string) => {
    await setActiveModel({ id: newModel } as any);
    setModel(newModel);
    await refreshModels();
  }, [refreshModels]);

  useEffect(() => {
    void loadModels();
  }, [loadModels]);

  const handleSelect = useCallback((newModel: string) => {
    setPendingModel(newModel);
    setShowConfirm(true);
  }, []);

  const confirm = useCallback(() => {
    if (!pendingModel) return;
    void handleConfirmChange(pendingModel);
    setShowConfirm(false);
    setPendingModel(null);
  }, [pendingModel, handleConfirmChange]);

  const cancel = useCallback(() => {
    setPendingModel(null);
    setShowConfirm(false);
  }, []);

  return {
    model,
    modelsList,
    showConfirm,
    handleSelect,
    refreshModels,
    confirm,
    cancel,
  };
}
