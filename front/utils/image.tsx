import { baseURL } from "../api/axiosConfig";

export function toFileUri(imageId?: string | null): string {
	if (imageId) {
		return `${baseURL}/pictures/${imageId}/recover?type=full`;
	}
	return "https://placehold.co/400x400/000000/FFFFFF.png";
}

