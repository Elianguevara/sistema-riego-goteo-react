// Archivo: src/types/analyst.types.ts

// Para el endpoint /farm-statuses
export interface FarmStatus {
  farmId: number;
  name: string;
  latitude: number;
  longitude: number;
  status: 'OK' | 'ALERTA' | 'INACTIVA'; // Asumiendo posibles estados
  activeAlertsCount: number;
}

// Para el endpoint /water-balance/{farmId}
export interface WaterBalance {
  date: string; // Formato ISO 8601
  irrigationWater: number; // en m³
  effectiveRain: number; // en mm convertidos a m³/ha o similar
}

// Para el endpoint /task-summary
export interface TaskSummary {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}