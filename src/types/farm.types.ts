// --- Interfaces para las respuestas de la API (lo que recibimos) ---

export interface Farm {
  id: number;
  name: string;
  location: string;
  reservoirCapacity: number;
  farmSize: number;
}

export interface IrrigationEquipment {
  id: number;
  name: string;
  measuredFlow: number;
  hasFlowMeter: boolean;
  equipmentType: string;
  equipmentStatus: string;
  farmId: number;
  farmName: string;
}

export interface WaterSource {
  id: number;
  type: string;
  farmId: number;
  farmName: string;
}

export interface Sector {
  id: number;
  name: string;
  farmId: number;
  farmName: string;
  equipmentId?: number;
  equipmentName?: string;
}

export interface HumiditySensor {
  id: number;
  sensorType: string;
  humidityLevel: number;
  measurementDatetime: string;
  sectorId: number;
  sectorName: string;
  farmId: number;
  farmName: string;
}

// --- Interfaces para los datos de Formularios (lo que enviamos) ---

// Para crear una Finca (basado en el supuesto FarmRequest)
export interface FarmCreateData {
  name: string;
  location: string;
  reservoirCapacity: number;
  farmSize: number;
}

// Para actualizar una Finca
export interface FarmUpdateData extends FarmCreateData {}

// Para crear un Equipo (basado en IrrigationEquipmentRequest)
export interface EquipmentCreateData {
  name: string;
  measuredFlow: number;
  hasFlowMeter: boolean;
  equipmentType: string;
  equipmentStatus: string;
}

// Para actualizar un Equipo
export interface EquipmentUpdateData extends EquipmentCreateData {}

// Para crear un Sector (basado en SectorRequest)
export interface SectorCreateData {
  name: string;
  equipmentId?: number;
}

// Para actualizar un Sector
export interface SectorUpdateData extends SectorCreateData {}

// ... (interfaces existentes)

// Para crear una Fuente de Agua
export interface WaterSourceCreateData {
  type: string;
}

// Para actualizar una Fuente de Agua
export interface WaterSourceUpdateData extends WaterSourceCreateData {}