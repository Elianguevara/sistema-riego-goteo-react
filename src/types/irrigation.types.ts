// Archivo: src/types/irrigation.types.ts

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
  dailyPrecipitations?: Record<string, number>;
}


// --- Estructuras para crear y recibir registros de riego (sin cambios) ---

export interface IrrigationCreateData {
  startDateTime: string;
  endDateTime: string;
  /**
   * Opcional. Si se omite (null), el backend calcula automáticamente el volumen
   * usando caudal × tiempo. Si se envía, se interpreta como lectura manual del
   * caudalímetro y el backend lo almacena con isManualWaterVolume = true.
   */
  waterAmount: number | null;
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
  isManualWaterVolume: boolean;
  sectorId: number;
  sectorName: string;
  equipmentId: number;
  equipmentName: string;
}
