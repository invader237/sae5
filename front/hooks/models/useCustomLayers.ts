import { useCallback, useEffect, useState } from "react";
import { fetchLayersCatalog } from "@/api/model.api";
import type { LayerCatalogItem } from "@/api/DTO/layerCatalog.dto";
import type { CustomLayerDTO } from "@/api/DTO/customLayers.dto";

/**
 * Couche configurée par l'utilisateur avec un ID local unique.
 */
export interface ConfiguredLayer extends CustomLayerDTO {
  id: string;
}

/**
 * Hook pour gérer le catalogue de couches PyTorch et la configuration
 * des couches custom pour l'entraînement from scratch.
 */
export function useCustomLayers() {
  const [catalog, setCatalog] = useState<LayerCatalogItem[]>([]);
  const [configuredLayers, setConfiguredLayers] = useState<ConfiguredLayer[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

  // Charger le catalogue depuis l'API
  const loadCatalog = useCallback(async () => {
    setIsLoadingCatalog(true);
    try {
      const data = await fetchLayersCatalog();
      setCatalog(data);
    } catch (error) {
      console.error("Erreur chargement catalogue couches :", error);
    } finally {
      setIsLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  // Générer un ID unique pour chaque couche ajoutée
  const generateId = useCallback((): string => {
    return `layer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }, []);

  // Ajouter une couche avec ses paramètres par défaut
  const addLayer = useCallback(
    (catalogItem: LayerCatalogItem) => {
      const defaultParams: Record<string, number> = {};
      for (const [key, def] of Object.entries(catalogItem.params)) {
        defaultParams[key] = def.default;
      }

      const newLayer: ConfiguredLayer = {
        id: generateId(),
        type: catalogItem.type,
        params: defaultParams,
      };

      setConfiguredLayers((prev) => [...prev, newLayer]);
    },
    [generateId]
  );

  // Supprimer une couche par son ID
  const removeLayer = useCallback((layerId: string) => {
    setConfiguredLayers((prev) => prev.filter((l) => l.id !== layerId));
  }, []);

  // Modifier un paramètre d'une couche
  const updateLayerParam = useCallback(
    (layerId: string, paramKey: string, value: number) => {
      setConfiguredLayers((prev) =>
        prev.map((layer) =>
          layer.id === layerId
            ? { ...layer, params: { ...layer.params, [paramKey]: value } }
            : layer
        )
      );
    },
    []
  );

  // Déplacer une couche vers le haut
  const moveLayerUp = useCallback((index: number) => {
    if (index <= 0) return;
    setConfiguredLayers((prev) => {
      const newLayers = [...prev];
      [newLayers[index - 1], newLayers[index]] = [
        newLayers[index],
        newLayers[index - 1],
      ];
      return newLayers;
    });
  }, []);

  // Déplacer une couche vers le bas
  const moveLayerDown = useCallback((index: number) => {
    setConfiguredLayers((prev) => {
      if (index >= prev.length - 1) return prev;
      const newLayers = [...prev];
      [newLayers[index], newLayers[index + 1]] = [
        newLayers[index + 1],
        newLayers[index],
      ];
      return newLayers;
    });
  }, []);

  // Réinitialiser toutes les couches
  const clearLayers = useCallback(() => {
    setConfiguredLayers([]);
  }, []);

  // Obtenir les catégories uniques du catalogue
  const categories = Array.from(
    new Set(catalog.map((item) => item.category))
  );

  // Couches groupées par catégorie
  const catalogByCategory = categories.reduce(
    (acc, category) => {
      acc[category] = catalog.filter((item) => item.category === category);
      return acc;
    },
    {} as Record<string, LayerCatalogItem[]>
  );

  // Convertir en format DTO pour l'envoi au backend
  const toDTO = useCallback(() => {
    return {
      layers: configuredLayers.map(({ type, params }) => ({
        type,
        params,
      })),
    };
  }, [configuredLayers]);

  const hasLayers = configuredLayers.length > 0;

  return {
    catalog,
    catalogByCategory,
    categories,
    configuredLayers,
    isLoadingCatalog,
    hasLayers,
    loadCatalog,
    addLayer,
    removeLayer,
    updateLayerParam,
    moveLayerUp,
    moveLayerDown,
    clearLayers,
    toDTO,
  };
}
