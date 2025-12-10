import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { RoomDTO } from "@/api/DTO/room.dto";

const departments = ["INFO", "GEA", "TC"];
const roomTypes = ["IT", "NORMAL", "AMPHI"];

type Props = {
  visible: boolean;
  room?: RoomDTO; 
  onClose: () => void;
  onSubmit: (data: RoomDTO) => void;
};

const RoomModal = ({ visible, room, onClose, onSubmit }: Props) => {
  const [name, setName] = useState(room?.name ?? "");
  const [floor, setFloor] = useState(room?.floor ?? 0);
  const [department, setDepartment] = useState(room?.departement ?? departments[0]);
  const [type, setType] = useState(room?.type ?? roomTypes[0]);

  const mode = room ? "edit" : "add";

  useEffect(() => {
    if (room) {
      setName(room.name);
      setFloor(room.floor);
      setDepartment(room.departement);
      setType(room.type);
    } else {
      setName("");
      setFloor(0);
      setDepartment(departments[0]);
      setType(roomTypes[0]);
    }
  }, [room, visible]);

  const handleNameChange = (v: string) => {
    const up = v.toUpperCase();
    const regex = /^[A-Z][0-9]{0,3}$/;
    if (up === "" || regex.test(up)) {
      setName(up);

      // Si le deuxième caractère est un chiffre, on le prend comme étage
      if (up.length >= 2) {
        const firstDigit = parseInt(up[1], 10);
        if (!isNaN(firstDigit)) setFloor(firstDigit);
      }
    }
  };

  const handleSubmit = () => {
    const payload: RoomDTO = {
      ...(room?.id && { id: room.id }),
      name,
      floor,
      departement: department,
      type,
    };
    onSubmit(payload);
  };

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
            onPress={handleSubmit}
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
