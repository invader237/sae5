import { useCallback, useEffect, useState } from "react";
import { getRoomAnalytics, getRooms, saveRoom } from "@/api/room.api";
import RoomDTO from "@/api/DTO/room.dto";
import RoomAnalyticsDTO from "@/api/DTO/roomAnalytics.dto";

export function useRoomManagement() {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [analytics, setAnalytics] = useState<RoomAnalyticsDTO | null>(null);
  const [modalListVisible, setModalListVisible] = useState(false);
  const [modalRoomVisible, setModalRoomVisible] = useState(false);
  const [modalValidatedPicturesVisible, setModalValidatedPicturesVisible] = useState(false);
  const [validatedPicturesRoomId, setValidatedPicturesRoomId] = useState<string | null>(null);
  const [editingRoom, setEditingRoom] = useState<RoomDTO | null>(null);

  const loadRooms = useCallback(async () => {
    const list = await getRooms();
    setRooms(list);
    setModalListVisible(true);
  }, []);

  const refreshAnalytics = useCallback(async () => {
    const data = await getRoomAnalytics();
    setAnalytics(data);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingRoom(null);
    setModalRoomVisible(true);
  }, []);

  const openEditModal = useCallback((room: RoomDTO) => {
    setEditingRoom(room);
    setModalRoomVisible(true);
  }, []);

  const openValidatedPicturesModal = useCallback((room: RoomDTO) => {
    setValidatedPicturesRoomId(room.id);
    setModalValidatedPicturesVisible(true);
  }, []);

  const saveRoomAndRefresh = useCallback(async (data: RoomDTO) => {
    const isEdit = !!data.id;
    await saveRoom(data as any);
    const list = await getRooms();
    setRooms(list);
    setModalRoomVisible(false);
    return isEdit;
  }, []);

  useEffect(() => {
    void refreshAnalytics();
  }, [refreshAnalytics]);

  return {
    rooms,
    analytics,
    modalListVisible,
    modalRoomVisible,
    modalValidatedPicturesVisible,
    validatedPicturesRoomId,
    editingRoom,
    setModalListVisible,
    setModalRoomVisible,
    setModalValidatedPicturesVisible,
    loadRooms,
    refreshAnalytics,
    openAddModal,
    openEditModal,
    openValidatedPicturesModal,
    saveRoomAndRefresh,
  };
}
