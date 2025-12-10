import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { saveRoom, getRooms } from "@/api/room.api";
import { RoomDTO } from "@/api/DTO/room.dto";

import RoomListModal from "@/components/room-managment-components/RoomListModal";
import RoomModal from "@/components/room-managment-components/RoomModal";

const RoomManagementPanel = () => {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [modalListVisible, setModalListVisible] = useState(false);
  const [modalRoomVisible, setModalRoomVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomDTO | null>(null);

  const loadRooms = async () => {
    try {
      const list = await getRooms();
      setRooms(list);
      setModalListVisible(true);
    } catch {
      Alert.alert("Erreur", "Impossible de récupérer les salles");
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

  return (
    <View className="bg-white p-4 border border-gray-300 rounded-lg gap-4">

      {/* HEADER */}
      <View className="flex-row items-center justify-between">
        <Text className="text-[#333] text-lg font-bold">Gestion des salles</Text>
        <TouchableOpacity onPress={loadRooms} className="bg-[#007bff] rounded-md px-4 py-2">
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
          <Text className="text-white font-bold text-center">Voir les salles</Text>
        </TouchableOpacity>
      </View>

      {/* MODALS */}
      <RoomListModal
        visible={modalListVisible}
        rooms={rooms}
        onClose={() => setModalListVisible(false)}
        onEdit={openEditModal}
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
