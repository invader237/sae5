export interface ModelLightDTO {
	id: string | null;
	name: string | null;
}

export default interface HistoryDTO {
	id: string;
	image_id?: string | null;
	room_name?: string | null;
	scanned_at: string;
	model?: ModelLightDTO | null;
}

