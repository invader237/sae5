import RoomLightDTO from './roomLight.dto';

export default interface PicturePvaDTO {
  id?: string;
  path?: string;
  recognition_percentage?: number;
  room?: RoomLightDTO;
}
