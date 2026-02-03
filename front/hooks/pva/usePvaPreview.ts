import { useCallback, useEffect, useMemo, useState } from "react";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";
import { fetchToValidatePictures } from "@/api/picture.api";

type UsePvaPreviewOptions = {
  previewCount?: number;
};

export function usePvaPreview({ previewCount = 5 }: UsePvaPreviewOptions = {}) {
  const [pictures, setPictures] = useState<PicturePvaDTO[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const pics = await fetchToValidatePictures(previewCount, 0);
      setPictures(pics);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur rafraîchissement PVA :", error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [previewCount]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const previewPictures = useMemo(
    () => pictures.slice(0, previewCount),
    [pictures, previewCount]
  );

  const handleValidated = useCallback((validatedIds: string[]) => {
    setPictures((prev) => prev.filter((pic) => !validatedIds.includes(pic.id)));
  }, []);

  const handleDeleted = useCallback((deletedIds: string[]) => {
    setPictures((prev) => prev.filter((pic) => !deletedIds.includes(pic.id)));
  }, []);

  return {
    pictures,
    previewPictures,
    isRefreshing,
    refreshKey,
    refresh,
    handleValidated,
    handleDeleted,
  };
}
