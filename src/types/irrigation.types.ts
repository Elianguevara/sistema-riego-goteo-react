// Archivo: src/types/irrigation.types.ts

// --- INTERFACES PARA LA VISTA MENSUAL (se mantienen igual) ---

export interface DailyIrrigationDetail {
  irrigationId: number;
  equipmentName: string;
  waterAmount: number;
  irrigationHours: number;
}

export type DailyIrrigationMap = Record<string, DailyIrrigationDetail[]>;

export interface MonthlyIrrigationSectorView {
  sectorId: number;
  sectorName: string;
  dailyIrrigations: DailyIrrigationMap;
}


// --- ¡INTERFACES MODIFICADAS! ---

// Estructura para crear un nuevo registro de riego (según tu especificación)
export interface IrrigationCreateData {
  startDateTime: string;      // Formato ISO: "2025-08-23T10:00:00"
  endDateTime: string;        // Formato ISO: "2025-08-23T12:30:00"
  waterAmount: number;        // Cantidad de agua (ej: 150.5)
  irrigationHours: number;    // Horas de riego (ej: 2.5)
  sectorId: number;           // ID del sector
  equipmentId: number;        // ID del equipo
}

// Estructura de un registro de riego individual (respuesta de la API)
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