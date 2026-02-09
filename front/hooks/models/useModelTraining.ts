import { useCallback, useEffect, useState } from "react";
import { trainModel } from "@/api/model.api";
import { fetchRoomForTraining } from "@/api/room.api";
import ModelTrainingDTO from "@/api/DTO/modelTraining.dto";
import { ScratchLayersDTO } from "@/api/DTO/scratchLayers.dto";
import RoomLightDTO from "@/api/DTO/roomLight.dto";
import { DEFAULT_SCRATCH_LAYERS } from "./modelTraining.config";
import { useCustomLayers } from "./useCustomLayers";


type TrainingType = "base" | "scratch";

export function useModelTraining() {
  const [isTraining, setIsTraining] = useState(false);
  const [rooms, setRooms] = useState<RoomLightDTO[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [scratchLayers, setScratchLayers] = useState<ScratchLayersDTO>(DEFAULT_SCRATCH_LAYERS);
  const [useCustomArchitecture, setUseCustomArchitecture] = useState(false);

  const customLayers = useCustomLayers();

  const [trainingConfig, setTrainingConfig] = useState<ModelTrainingDTO>({
    type: "base",
    epochs: 10,
    batchSize: 32,
    learningRate: 0.001,
    roomList: [],
    scratchLayers: DEFAULT_SCRATCH_LAYERS,
  });

  const refreshRooms = useCallback(async () => {
    try {
      const fetchedRooms = await fetchRoomForTraining();
      setRooms(fetchedRooms);
      setSelectedRooms((prev) =>
        prev.length === 0 ? fetchedRooms.map((room) => room.id) : prev
      );
    } catch (error) {
      console.error("Erreur chargement salles d'entraînement :", error);
    }
  }, []);

  useEffect(() => {
    void refreshRooms();
  }, [refreshRooms]);

  useEffect(() => {
    const selectedRoomObjects = rooms.filter((room) =>
      selectedRooms.includes(room.id)
    );
    setTrainingConfig((prev) => ({
      ...prev,
      roomList: selectedRoomObjects,
    }));
  }, [selectedRooms, rooms]);

  const toggleRoom = useCallback((id: string) => {
    setSelectedRooms((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }, []);

  const updateConfig = useCallback(<K extends keyof ModelTrainingDTO>(
    key: K,
    value: ModelTrainingDTO[K]
  ) => {
    setTrainingConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const setTrainingType = useCallback((type: TrainingType) => {
    updateConfig("type", type);
  }, [updateConfig]);

  const toggleCustomArchitecture = useCallback(() => {
    setUseCustomArchitecture((prev) => !prev);
  }, []);

  const hasAtLeastOneLayer = useCallback((layers: ScratchLayersDTO): boolean => {
    return layers.conv1 || layers.conv2 || layers.fc1;
  }, []);

  const canTrain =
    trainingConfig.type === "base" ||
    (useCustomArchitecture
      ? customLayers.hasLayers
      : hasAtLeastOneLayer(scratchLayers));

  const toggleScratchLayer = useCallback(<K extends keyof ScratchLayersDTO>(
    layerKey: K
  ) => {
    setScratchLayers((prev) => {
      const newLayers = { ...prev, [layerKey]: !prev[layerKey] };
      setTrainingConfig((prevConfig) => ({
        ...prevConfig,
        scratchLayers: newLayers,
      }));
      return newLayers;
    });
  }, []);

  const train = useCallback(async () => {
    setIsTraining(true);
    try {
      const payload: ModelTrainingDTO = {
        ...trainingConfig,
        scratchLayers:
          trainingConfig.type === "scratch" && !useCustomArchitecture
            ? scratchLayers
            : undefined,
        customLayers:
          trainingConfig.type === "scratch" && useCustomArchitecture
            ? customLayers.toDTO()
            : undefined,
      };
      await trainModel(payload);
    } finally {
      setIsTraining(false);
    }
  }, [trainingConfig, scratchLayers, useCustomArchitecture, customLayers]);

  return {
    isTraining,
    rooms,
    selectedRooms,
    trainingConfig,
    scratchLayers,
    canTrain,
    useCustomArchitecture,
    customLayers,
    refreshRooms,
    toggleRoom,
    updateConfig,
    setTrainingType,
    toggleScratchLayer,
    toggleCustomArchitecture,
    train,
  };
}
