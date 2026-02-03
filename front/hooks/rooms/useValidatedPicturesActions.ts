import { useCallback, useState } from "react";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";
import { deletePicturesPva } from "@/api/picture.api";

type UseValidatedPicturesActionsOptions = {
  pictures: PicturePvaDTO[];
  removeByIds: (ids: string[]) => void;
  refresh: () => Promise<void> | void;
  onDeleted?: (ids: string[]) => void;
  onUpdated?: () => void;
  onError?: (message: string) => void;
};

export function useValidatedPicturesActions({
  pictures,
  removeByIds,
  refresh,
  onDeleted,
  onUpdated,
  onError,
}: UseValidatedPicturesActionsOptions) {
  const [selectedPictures, setSelectedPictures] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelectedPictures((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPictures([]);
  }, []);

  const deleteSelected = useCallback(async () => {
    setIsDeleting(true);
    try {
      const picturesToDelete = pictures.filter((pic) =>
        selectedPictures.includes(pic.id ?? "")
      );

      await deletePicturesPva(picturesToDelete);

      const deletedIds = [...selectedPictures];
      removeByIds(deletedIds);
      clearSelection();
      onDeleted?.(deletedIds);
      onUpdated?.();

      if (picturesToDelete.length > 0 && pictures.length === picturesToDelete.length) {
        await refresh();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      onError?.("Impossible de supprimer les images.");
    } finally {
      setIsDeleting(false);
    }
  }, [pictures, selectedPictures, removeByIds, refresh, onDeleted, onUpdated, clearSelection, onError]);

  return {
    selectedPictures,
    isDeleting,
    toggleSelect,
    clearSelection,
    deleteSelected,
  };
}
