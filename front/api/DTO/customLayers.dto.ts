/**
 * Représente une couche custom configurée par l'utilisateur.
 */
export interface CustomLayerDTO {
  type: string;
  params: Record<string, number>;
}

/**
 * Liste ordonnée de couches custom pour l'entraînement from scratch.
 */
export interface CustomLayersDTO {
  layers: CustomLayerDTO[];
}
