// Archivo: src/types/irrigation.types.ts

import type { PrecipitationRecord } from './precipitation.types';

// --- INTERFACES PARA LA VISTA MENSUAL ---

export interface DailyIrrigationDetail {
  irrigationId: number;
  equipmentName: string;
  waterAmount: number;
  irrigationHours: number;
}

export type DailyIrrigationMap = Record<string, DailyIrrigationDetail[]>;

// --- INTERFAZ MODIFICADA ---
export interface MonthlyIrrigationSectorView {
  sectorId: number;
  sectorName: string;
  dailyIrrigations: DailyIrrigationMap;
  // --- CAMPO AÑADIDO ---
  // El backend ahora también nos enviará las precipitaciones por día.
  dailyPrecipitations?: Record<string, PrecipitationRecord[]>; 
}


// --- Estructuras para crear y recibir registros de riego (sin cambios) ---

export interface IrrigationCreateData {
  startDateTime: string;
  endDateTime: string;
  waterAmount: number;
  irrigationHours: number;
  sectorId: number;
  equipmentId: number;
}

export interface IrrigationRecord {
    id: number;
    startDateTime: string;
    endDateTime: string;
    waterAmount: number;
    irrigationHours: number;
    sectorId: number;
    sectorName: string;
    equipmentId: number;
    equipmentName: string;
}
