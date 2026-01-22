import { useCallback, useEffect, useState } from "react";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";
import { fetchValidatedPicturesByRoom } from "@/api/picture.api";

const DEFAULT_ERROR_MESSAGE = "Impossible de charger les images validées.";

type UseValidatedPicturesByRoomOptions = {
  roomId: string | null;
  visible: boolean;
  itemsPerPage: number;
};

export function useValidatedPicturesByRoom({
  roomId,
  visible,
  itemsPerPage,
}: UseValidatedPicturesByRoomOptions) {
  const [pictures, setPictures] = useState<PicturePvaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const refresh = useCallback(async () => {
    setErrorMessage(null);

    if (!roomId) {
      setPictures([]);
      setPage(1);
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchValidatedPicturesByRoom(roomId, itemsPerPage, 0);
      setPictures(data);
      setPage(1);
      setHasMore(data.length === itemsPerPage);
    } catch (error) {
      console.error("Erreur chargement images validées :", error);
      setPictures([]);
      setHasMore(false);
      setErrorMessage(DEFAULT_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, itemsPerPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !roomId || isLoadingMore) return;

    setIsLoadingMore(true);

    const offset = page * itemsPerPage;
    try {
      const more = await fetchValidatedPicturesByRoom(roomId, itemsPerPage, offset);

      if (more.length === 0) {
        setHasMore(false);
        return;
      }

      setPictures((prev) => [...prev, ...more]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur chargement page suivante :", error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, roomId, isLoadingMore, page, itemsPerPage]);

  const removeByIds = useCallback((ids: string[]) => {
    setPictures((prev) => prev.filter((p) => !ids.includes(p.id ?? "")));
  }, []);

  useEffect(() => {
    if (!visible) return;
    void refresh();
  }, [visible, roomId, refresh]);

  return {
    pictures,
    isLoading,
    isLoadingMore,
    errorMessage,
    hasMore,
    refresh,
    loadMore,
    removeByIds,
    setPictures,
  };
}
