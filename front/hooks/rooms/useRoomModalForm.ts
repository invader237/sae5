import { useCallback, useEffect, useState } from "react";
import RoomDTO from "@/api/DTO/room.dto";

type UseRoomModalFormOptions = {
  room?: RoomDTO;
  visible: boolean;
  onSubmit: (data: RoomDTO) => void;
};

const departments = ["INFO", "GEA", "TC"];
const roomTypes = ["IT", "NORMAL", "AMPHI"];

export function useRoomModalForm({ room, visible, onSubmit }: UseRoomModalFormOptions) {
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

  const handleNameChange = useCallback((value: string) => {
    const up = value.toUpperCase();
    const regex = /^[A-Z][0-9]{0,3}$/;
    if (up === "" || regex.test(up)) {
      setName(up);

      if (up.length >= 2) {
        const firstDigit = parseInt(up[1], 10);
        if (!isNaN(firstDigit)) setFloor(firstDigit);
      }
    }
  }, []);

  const submit = useCallback(() => {
    const payload: RoomDTO = {
      ...(room?.id && { id: room.id }),
      name,
      floor,
      departement: department,
      type,
    };
    onSubmit(payload);
  }, [room, name, floor, department, type, onSubmit]);

  return {
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
  };
}
