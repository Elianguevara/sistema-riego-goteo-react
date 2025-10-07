// Archivo: src/types/operationLog.types.ts

// Lo que RECIBIMOS de la API
export interface OperationLog {
  id: number;
  farmId: number;
  farmName: string;
  startDatetime: string; // Formato ISO 8601
  endDatetime: string | null; // Puede ser nulo si la operación no ha terminado
  description: string;
  createdByUsername: string;
}

// Lo que ENVIAMOS a la API para CREAR un registro
export interface OperationLogCreateData {
  startDatetime: string;
  endDatetime?: string | null;
  description: string;
}

// Lo que ENVIAMOS a la API para ACTUALIZAR
export interface OperationLogUpdateData extends OperationLogCreateData {}