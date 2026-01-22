import { useCallback, useState } from "react";
import PicturePvaDTO from "@/api/DTO/picturePva.dto";
import { deletePicturesPva, validatePictures } from "@/api/picture.api";
import type { Dispatch, SetStateAction } from "react";

type UsePvaModalActionsOptions = {
  pictures: PicturePvaDTO[];
  setPictures: Dispatch<SetStateAction<PicturePvaDTO[]>>;
  onValidated?: (ids: string[]) => void;
  onDeleted?: (ids: string[]) => void;
  onClose: () => void;
  onError?: (message: string) => void;
};

export function usePvaModalActions({
  pictures,
  setPictures,
  onValidated,
  onDeleted,
  onClose,
  onError,
}: UsePvaModalActionsOptions) {
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

  const validateSelected = useCallback(async () => {
    try {
      const picturesToValidate = pictures.filter((pic) =>
        selectedPictures.includes(pic.id)
      );
      await validatePictures(picturesToValidate);
      onValidated?.(selectedPictures);
      clearSelection();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la validation :", error);
    }
  }, [pictures, selectedPictures, onValidated, clearSelection, onClose]);

  const deleteSelected = useCallback(async () => {
    setIsDeleting(true);
    try {
      const picturesToDelete = pictures.filter((pic) =>
        selectedPictures.includes(pic.id)
      );
      await deletePicturesPva(picturesToDelete);
      setPictures((prev) => prev.filter((pic) => !selectedPictures.includes(pic.id)));
      onDeleted?.(selectedPictures);
      clearSelection();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      onError?.("Impossible de supprimer les images.");
    } finally {
      setIsDeleting(false);
    }
  }, [pictures, selectedPictures, setPictures, onDeleted, clearSelection, onClose, onError]);

  return {
    selectedPictures,
    isDeleting,
    toggleSelect,
    clearSelection,
    validateSelected,
    deleteSelected,
  };
}
