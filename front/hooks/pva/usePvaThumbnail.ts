import { useEffect, useState } from "react";
import { baseURL } from "@/api/axiosConfig";

const MAX_CACHE = 50;
const imageCache: Record<string, string> = {};
const cacheOrder: string[] = [];

const addToCache = (id: string, data: string) => {
  if (!imageCache[id]) {
    if (cacheOrder.length >= MAX_CACHE) {
      const oldestId = cacheOrder.shift();
      if (oldestId) delete imageCache[oldestId];
    }
    cacheOrder.push(id);
  }
  imageCache[id] = data;
};

export function usePvaThumbnail(pictureId?: string | null) {
  const [uri, setUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!pictureId) return;

    const fetchImage = async () => {
      if (imageCache[pictureId]) {
        setUri(imageCache[pictureId]);
        return;
      }

      try {
        const response = await fetch(
          `${baseURL}/pictures/${pictureId}/recover?type=thumbnail`
        );
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          addToCache(pictureId, dataUrl);
          setUri(dataUrl);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Erreur chargement image :", error);
      }
    };

    void fetchImage();
  }, [pictureId]);

  return { uri };
}
