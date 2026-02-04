import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import RoomDTO from "@/api/DTO/room.dto";

import RoomListModal from "@/components/room-managment-components/RoomListModal";
import RoomModal from "@/components/room-managment-components/RoomModal";
import RoomValidatedPicturesModal from "@/components/room-managment-components/RoomValidatedPicturesModal";
import ProgressBar from "../ProgressBar";
import { useRoomManagement } from "@/hooks/rooms/useRoomManagement";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";

const RoomManagementPanel = () => {
  const {
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
  } = useRoomManagement();

  const handleLoadRooms = async () => {
    try {
      await loadRooms();
    } catch {
      Alert.alert("Erreur", "Impossible de récupérer les salles");
    }
  };

  const handleLoadAnalytics = async () => {
    try {
      await refreshAnalytics();
    } catch {
      Alert.alert(
        "Erreur",
        "Impossible de récupérer les statistiques des salles"
      );
    }
  };

  const handleSave = async (data: RoomDTO) => {
    try {
      const isEdit = await saveRoomAndRefresh(data);
      Alert.alert("Succès", isEdit ? "Salle modifiée" : "Salle ajoutée");
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder la salle");
    }
  };

  return (
    <View 
      className="p-5 gap-4"
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
            Gestion des salles
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleLoadAnalytics}
          className="flex-row items-center justify-center"
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

      {/* ACTIONS */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={openAddModal}
          className="flex-1 flex-row items-center justify-center py-3"
          style={{
            backgroundColor: Colors.primary,
            borderRadius: BorderRadius.full,
          }}
        >
          <MaterialIcons name="add" size={20} color={Colors.white} />
          <Text className="font-bold ml-2" style={{ color: Colors.onPrimary }}>
            Ajouter
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLoadRooms}
          className="flex-1 flex-row items-center justify-center py-3"
          style={{
            backgroundColor: Colors.inputBackground,
            borderRadius: BorderRadius.full,
                        borderWidth: 1,
                        borderColor: Colors.border,
          }}
        >
          <MaterialIcons name="list" size={20} color={Colors.textSecondary} />
          <Text 
            className="font-bold ml-2"
            style={{ color: Colors.textSecondary 
              
            }}
          >
            Voir les salles
          </Text>
        </TouchableOpacity>
      </View>

      {/* DIVIDER */}
      <View 
        className="my-1"
        style={{ 
          height: 1, 
          backgroundColor: Colors.border 
        }} 
      />

      {/* LOW COVERAGE SECTION */}
      <View className="gap-3">
        <View className="flex-row items-center">
          <MaterialIcons name="warning" size={18} color={Colors.warning} />
          <Text 
            className="font-semibold ml-2"
            style={{ color: Colors.text }}
          >
            Salles à faible couverture
          </Text>
        </View>
        
        {analytics?.low_coverage && analytics.low_coverage.length > 0 ? (
          analytics.low_coverage.map((room) => (
            <View 
              key={room.id} 
              className="p-4"
              style={{
                backgroundColor: Colors.inputBackground,
                borderRadius: BorderRadius.md,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text 
                  className="font-medium"
                  style={{ color: Colors.text }}
                >
                  {room.name}
                </Text>
                <Text 
                  className="text-sm font-semibold"
                  style={{ color: Colors.textSecondary }}
                >
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
          <View 
            className="p-4 flex-row items-center"
            style={{
              backgroundColor: Colors.primaryLight,
              borderRadius: BorderRadius.md,
            }}
          >
            <MaterialIcons name="check-circle" size={20} color={Colors.primaryDark} />
            <Text 
              className="text-sm ml-2"
              style={{ color: Colors.primaryDark }}
            >
              Toutes les salles ont une bonne couverture !
            </Text>
          </View>
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
