import React from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { RoomDTO } from "@/api/DTO/room.dto";
import { useRoomModalForm } from "@/hooks/rooms/useRoomModalForm";
import { Colors, BorderRadius } from "@/constants/theme";

type Props = {
  visible: boolean;
  room?: RoomDTO; 
  onClose: () => void;
  onSubmit: (data: RoomDTO) => void;
};

const RoomModal = ({ visible, room, onClose, onSubmit }: Props) => {
  const {
    name,
    floor,
    department,
    type,
    mode,
    setFloor,
    setDepartment,
    setType,
    handleNameChange,
    submit,
    departments,
    roomTypes,
  } = useRoomModalForm({ room, visible, onSubmit });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: Colors.overlay }}
      >
        <View
          className="w-11/12 p-5"
          style={{
            backgroundColor: Colors.cardBackground,
            borderRadius: BorderRadius.lg,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >

          <Text className="text-lg font-bold mb-3" style={{ color: Colors.text }}>
            {mode === "add" ? "Ajouter une salle" : "Modifier la salle"}
          </Text>

          {/* ROOM FORM */}
          <TextInput
            placeholder="Nom de la salle"
            value={name}
            onChangeText={handleNameChange}
            className="rounded-md px-3 py-2 mb-3"
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              backgroundColor: Colors.inputBackground,
              color: Colors.text,
            }}
            placeholderTextColor={Colors.textMuted}
          />

          <View className="flex-row gap-2 mb-3">
            <View
              className="flex-1 rounded-md overflow-hidden"
              style={{ borderWidth: 1, borderColor: Colors.border }}
            >
              <Picker selectedValue={floor} onValueChange={setFloor}>
                {[0, 1, 2, 3].map((f) => (
                  <Picker.Item key={f} value={f} label={`Étage ${f}`} />
                ))}
              </Picker>
            </View>

            <View
              className="flex-1 rounded-md overflow-hidden"
              style={{ borderWidth: 1, borderColor: Colors.border }}
            >
              <Picker selectedValue={department} onValueChange={setDepartment}>
                {departments.map((d) => (
                  <Picker.Item key={d} value={d} label={d} />
                ))}
              </Picker>
            </View>
          </View>

          <View
            className="rounded-md overflow-hidden mb-4"
            style={{ borderWidth: 1, borderColor: Colors.border }}
          >
            <Picker selectedValue={type} onValueChange={setType}>
              {roomTypes.map((t) => (
                <Picker.Item key={t} value={t} label={t} />
              ))}
            </Picker>
          </View>

          {/* BUTTONS */}
          <TouchableOpacity
            className="px-4 py-2 rounded-md"
            style={{
              backgroundColor: mode === "add" ? Colors.success : Colors.primary,
              borderRadius: BorderRadius.md,
            }}
            onPress={submit}
          >
            <Text className="font-bold text-center" style={{ color: Colors.onPrimary }}>
              {mode === "add" ? "Ajouter" : "Mettre à jour"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} className="mt-3">
            <Text className="text-center" style={{ color: Colors.textSecondary }}>
              Annuler
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export default RoomModal;
