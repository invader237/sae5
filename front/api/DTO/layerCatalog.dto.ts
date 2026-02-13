/**
 * Représente la définition d'un paramètre d'une couche PyTorch.
 */
export interface LayerParamDefinition {
  type: "int" | "float";
  default: number;
  min?: number;
  max?: number;
  description: string;
}

/**
 * Représente une couche disponible dans le catalogue PyTorch.
 */
export interface LayerCatalogItem {
  type: string;
  category: string;
  label: string;
  description: string;
  params: Record<string, LayerParamDefinition>;
}
