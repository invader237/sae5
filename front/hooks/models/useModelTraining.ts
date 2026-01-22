import { useCallback, useEffect, useState } from "react";
import { trainModel } from "@/api/model.api";
import { fetchRoomForTraining } from "@/api/room.api";
import ModelTrainingDTO from "@/api/DTO/modelTraining.dto";
import RoomLightDTO from "@/api/DTO/roomLight.dto";

type TrainingType = "base" | "scratch";

export function useModelTraining() {
  const [isTraining, setIsTraining] = useState(false);
  const [rooms, setRooms] = useState<RoomLightDTO[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  const [trainingConfig, setTrainingConfig] = useState<ModelTrainingDTO>({
    type: "base",
    epochs: 10,
    batchSize: 32,
    learningRate: 0.001,
    roomList: [],
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

  const train = useCallback(async () => {
    setIsTraining(true);
    try {
      await trainModel(trainingConfig);
    } finally {
      setIsTraining(false);
    }
  }, [trainingConfig]);

  return {
    isTraining,
    rooms,
    selectedRooms,
    trainingConfig,
    refreshRooms,
    toggleRoom,
    updateConfig,
    setTrainingType,
    train,
  };
}
