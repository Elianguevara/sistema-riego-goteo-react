// Archivo: src/types/fertilization.types.ts

// Estructura para crear un nuevo registro de fertilización
export interface FertilizationCreateData {
  fertilizationDate: string; // Formato YYYY-MM-DD
  fertilizerType: string;
  quantityKg: number;
  sectorId: number;
}

// Estructura de un registro de fertilización una vez creado
export interface FertilizationRecord {
  id: number;
  fertilizationDate: string;
  fertilizerType: string;
  quantityKg: number;
  sectorId: number;
  sectorName: string;
  farmName: string;
}