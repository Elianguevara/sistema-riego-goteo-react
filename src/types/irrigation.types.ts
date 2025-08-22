// Archivo: src/types/irrigation.types.ts

// --- NUEVAS INTERFACES PARA LA VISTA MENSUAL ---

// Describe un único riego dentro de la vista diaria
export interface DailyIrrigationDetail {
  irrigationId: number;
  equipmentName: string;
  waterAmount: number;
  irrigationHours: number;
}

// La estructura que agrupa los riegos por día (la clave es el número del día)
export type DailyIrrigationMap = Record<string, DailyIrrigationDetail[]>;

// La respuesta principal del endpoint, que representa una fila (un sector) en la tabla
export interface MonthlyIrrigationSectorView {
  sectorId: number;
  sectorName: string;
  dailyIrrigations: DailyIrrigationMap;
}

// --- INTERFACES PARA CREAR/EDITAR (se mantienen similares) ---

// Estructura para crear un nuevo registro de riego
export interface IrrigationCreateData {
  irrigationDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  waterVolume: number; // en m³
}

// Estructura para actualizar un registro de riego
export interface IrrigationUpdateData extends IrrigationCreateData {}

// Estructura de un registro de riego individual (para el formulario)
export interface IrrigationRecord {
    id: number;
    irrigationDate: string;
    startTime: string;
    endTime: string;
    waterVolume: number;
    sectorId: number;
    farmId: number;
}
