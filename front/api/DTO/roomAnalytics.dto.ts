import RoomDTO from './room.dto';

export default interface RoomAnalyticsDTO {
    low_coverage: RoomDTO[];
    total_rooms: number;
}
