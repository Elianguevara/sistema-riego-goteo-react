// Archivo: src/types/precipitation.types.ts

/**
 * Define la estructura de datos para ENVIAR a la API
 * al crear o actualizar un registro de precipitación.
 */
export interface PrecipitationCreateData {
  precipitationDate: string; // Formato YYYY-MM-DD
  mmRain: number;
}

/**
 * Define la estructura de datos que se RECIBE de la API
 * como respuesta a una consulta o creación.
 */
export interface PrecipitationRecord {
  id: number;
  farmId: number;
  farmName: string;
  precipitationDate: string;
  mmRain: number;
  mmEffectiveRain: number;
}