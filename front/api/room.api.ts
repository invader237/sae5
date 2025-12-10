import axiosInstance from './axiosConfig';
import RoomLightDTO from './DTO/roomLight.dto';
import RoomDTO from './DTO/room.dto';

export const fetchRoomsForPva = async (): Promise<RoomLightDTO[]> => {
  try {
    const response = await axiosInstance.get('/rooms/pva');
    return response.data; 
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

export const saveRoom = async (room: RoomDTO): Promise<null> => {
    try {
        const response = await axiosInstance.post('/rooms', room);
        return response.data;
    } catch (error) {
        console.error('Error adding room:', error);
        throw error;
    }
}

export const getRooms = async (): Promise<RoomDTO[]> => {
    try {
        const response = await axiosInstance.get('/rooms');
        return response.data;
    } catch (error) {
        console.error('Error fetching rooms:', error);
        throw error;
    }
}
