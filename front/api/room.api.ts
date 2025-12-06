import axiosInstance from './axiosConfig';
import RoomLightDTO from './DTO/roomLight.dto';

export const fetchRoomsForPva = async (): Promise<RoomLightDTO[]> => {
  try {
    const response = await axiosInstance.get('/rooms/pva');
    return response.data; 
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};
