import React from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { RoomDTO } from "@/api/DTO/room.dto";
import { useRoomModalForm } from "@/hooks/rooms/useRoomModalForm";

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
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-11/12 bg-white p-5 rounded-lg border border-gray-300">

          <Text className="text-lg font-bold mb-3">
            {mode === "add" ? "Ajouter une salle" : "Modifier la salle"}
          </Text>

          {/* ROOM FORM */}
          <TextInput
            placeholder="Nom de la salle"
            value={name}
            onChangeText={handleNameChange}
            className="border border-gray-300 rounded-md px-3 py-2 mb-3"
          />

          <View className="flex-row gap-2 mb-3">
            <View className="flex-1 border border-gray-300 rounded-md overflow-hidden">
              <Picker selectedValue={floor} onValueChange={setFloor}>
                {[0, 1, 2, 3].map((f) => (
                  <Picker.Item key={f} value={f} label={`Étage ${f}`} />
                ))}
              </Picker>
            </View>

            <View className="flex-1 border border-gray-300 rounded-md overflow-hidden">
              <Picker selectedValue={department} onValueChange={setDepartment}>
                {departments.map((d) => (
                  <Picker.Item key={d} value={d} label={d} />
                ))}
              </Picker>
            </View>
          </View>

          <View className="border border-gray-300 rounded-md overflow-hidden mb-4">
            <Picker selectedValue={type} onValueChange={setType}>
              {roomTypes.map((t) => (
                <Picker.Item key={t} value={t} label={t} />
              ))}
            </Picker>
          </View>

          {/* BUTTONS */}
          <TouchableOpacity
            className={`px-4 py-2 rounded-md ${mode === "add" ? "bg-[#28a745]" : "bg-[#007bff]"}`}
            onPress={submit}
          >
            <Text className="text-white font-bold text-center">
              {mode === "add" ? "Ajouter" : "Mettre à jour"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} className="mt-3">
            <Text className="text-center">Annuler</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export default RoomModal;
