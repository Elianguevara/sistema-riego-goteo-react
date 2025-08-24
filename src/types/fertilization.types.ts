// Archivo: src/types/fertilization.types.ts

/**
 * Define la estructura de datos que se debe ENVIAR a la API
 * para registrar una nueva aplicación de fertilizante.
 * Coincide con el JSON Request Body del backend.
 */
export interface FertilizationCreateData {
  sectorId: number;
  date: string; // Formato YYYY-MM-DD
  fertilizerType: string;
  quantity: number;
  quantityUnit: 'KG' | 'LITERS'; // Debe ser uno de estos dos valores
}

/**
 * Define la estructura de datos que se RECIBE de la API
 * como respuesta a una creación o consulta exitosa.
 * Coincide con el JSON Response Body del backend.
 */
export interface FertilizationRecord {
  id: number;
  sectorId: number;
  sectorName: string;
  farmId: number;
  farmName: string;
  date: string;
  fertilizerType: string;
  quantity: number;
  quantityUnit: 'KG' | 'LITERS';
}