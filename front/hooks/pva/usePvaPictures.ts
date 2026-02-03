import { useCallback, useEffect, useState } from "react";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";
import { fetchToValidatePictures } from "@/api/picture.api";

type UsePvaPicturesOptions = {
  visible: boolean;
  refreshKey: number;
  itemsPerPage: number;
};

export function usePvaPictures({
  visible,
  refreshKey,
  itemsPerPage,
}: UsePvaPicturesOptions) {
  const [pictures, setPictures] = useState<PicturePvaDTO[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const refresh = useCallback(async () => {
    if (!visible) return;

    setIsLoading(true);
    try {
      const data = await fetchToValidatePictures(itemsPerPage, 0);
      setPictures(data);
      setPage(1);
      setHasMore(data.length === itemsPerPage);
    } catch (error) {
      console.error("Erreur chargement images à valider :", error);
      setPictures([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [visible, itemsPerPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const offset = page * itemsPerPage;

    try {
      const more = await fetchToValidatePictures(itemsPerPage, offset);

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
  }, [hasMore, isLoadingMore, page, itemsPerPage]);

  useEffect(() => {
    void refresh();
  }, [refresh, refreshKey]);

  return {
    pictures,
    setPictures,
    hasMore,
    isLoading,
    isLoadingMore,
    refresh,
    loadMore,
  };
}
