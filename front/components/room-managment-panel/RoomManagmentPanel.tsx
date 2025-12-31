import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { saveRoom, getRooms, getRoomAnalytics } from "@/api/room.api";
import RoomDTO from "@/api/DTO/room.dto";
import RoomAnalyticsDTO from "@/api/DTO/roomAnalytics.dto";

import RoomListModal from "@/components/room-managment-components/RoomListModal";
import RoomModal from "@/components/room-managment-components/RoomModal";
import RoomValidatedPicturesModal from "@/components/room-managment-components/RoomValidatedPicturesModal";
import ProgressBar from "../ProgressBar";

const RoomManagementPanel = () => {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [modalListVisible, setModalListVisible] = useState(false);
  const [modalRoomVisible, setModalRoomVisible] = useState(false);
  const [modalValidatedPicturesVisible, setModalValidatedPicturesVisible] = useState(false);
  const [validatedPicturesRoomId, setValidatedPicturesRoomId] = useState<string | null>(null);
  const [editingRoom, setEditingRoom] = useState<RoomDTO | null>(null);
  const [analytics, setAnalytics] = useState<RoomAnalyticsDTO | null>(null);

  const loadRooms = async () => {
    try {
      const list = await getRooms();
      setRooms(list);
      setModalListVisible(true);
    } catch {
      Alert.alert("Erreur", "Impossible de récupérer les salles");
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await getRoomAnalytics();
      setAnalytics(data);
    } catch {
      Alert.alert(
        "Erreur",
        "Impossible de récupérer les statistiques des salles"
      );
    }
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setModalRoomVisible(true);
  };

  const openEditModal = (room: RoomDTO) => {
    setEditingRoom(room);
    setModalRoomVisible(true);
  };

  const openValidatedPicturesModal = (room: RoomDTO) => {
    setValidatedPicturesRoomId(room.id);
    setModalValidatedPicturesVisible(true);
  };

  const handleSave = async (data: RoomDTO) => {
    const isEdit = !!data.id;
    try {
      await saveRoom(data as any);
      setRooms(await getRooms());
      Alert.alert("Succès", isEdit ? "Salle modifiée" : "Salle ajoutée");
      setModalRoomVisible(false);
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder la salle");
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <View className="bg-white p-4 border border-gray-300 rounded-lg gap-4">
      {/* HEADER */}
      <View className="flex-row items-center justify-between">
        <Text className="text-[#333] text-lg font-bold">
          Gestion des salles
        </Text>
        <TouchableOpacity
          onPress={loadAnalytics}
          className="bg-[#007bff] rounded-md px-4 py-2"
        >
          <MaterialIcons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* ACTIONS */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={openAddModal}
          className="bg-[#28a745] px-3 py-2 rounded-md flex-1"
        >
          <Text className="text-white font-bold text-center">Ajouter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={loadRooms}
          className="bg-[#6c757d] px-3 py-2 rounded-md flex-1"
        >
          <Text className="text-white font-bold text-center">
            Voir les salles
          </Text>
        </TouchableOpacity>
      </View>

      <View className="border border-gray-300" />

      <View className="gap-2">
        <Text className="text-[#333] text-medium font-small">
          Salles a faible couverture
        </Text>
        {analytics?.low_coverage && analytics.low_coverage.length > 0 ? (
          analytics.low_coverage.map((room) => (
            <View key={room.id} className="p-2 rounded-md p-2">
              <View
                key={room.id}
                className="flex-row justify-between items-center rounded-md mb-1"
              >
                <Text className="text-[#555] font-medium">{room.name}</Text>
                <Text className="text-[#555] text-sm">
                  {room.validated_picture_count} / 500
                </Text>
              </View>
              <ProgressBar
                value={room.validated_picture_count ?? 0}
                threshold={90}
                max={500}
                width="100%"
              />
            </View>
          ))
        ) : (
          <Text className="text-[#555] text-sm">
            Aucune salle avec une faible couverture.
          </Text>
        )}
      </View>

      {/* MODALS */}
      <RoomListModal
        visible={modalListVisible}
        rooms={rooms}
        onClose={() => setModalListVisible(false)}
        onEdit={openEditModal}
        onViewPictures={openValidatedPicturesModal}
      />

      <RoomValidatedPicturesModal
        visible={modalValidatedPicturesVisible}
        roomId={validatedPicturesRoomId}
        mode="gestion"
        onClose={() => setModalValidatedPicturesVisible(false)}
      />

      <RoomModal
        visible={modalRoomVisible}
        room={editingRoom ?? undefined}
        onClose={() => setModalRoomVisible(false)}
        onSubmit={handleSave}
      />
    </View>
  );
};

export default RoomManagementPanel;
