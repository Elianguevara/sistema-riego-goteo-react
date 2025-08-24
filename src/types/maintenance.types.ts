// Archivo: src/types/maintenance.types.ts

/**
 * Define la estructura de datos para ENVIAR a la API
 * al crear o actualizar un registro de mantenimiento.
 */
export interface MaintenanceCreateData {
  date: string; // Formato YYYY-MM-DD
  description: string;
  workHours?: number; // Es opcional
}

/**
 * Define la estructura de datos que se RECIBE de la API
 * como respuesta a una consulta o creación.
 */
export interface MaintenanceRecord {
  id: number;
  equipmentId: number;
  equipmentName: string;
  farmId: number;
  farmName: string;
  date: string;
  description: string;
  workHours: number | null;
}