// Archivo: src/types/operationLog.types.ts

// Lo que RECIBIMOS de la API
export interface OperationLog {
  id: number;
  farmId: number;
  farmName: string;
  operationDatetime: string; // Formato ISO 8601
  operationType: string;
  description?: string; // Es opcional
  createdByUsername: string;
}

// Lo que ENVIAMOS a la API para CREAR un registro
export interface OperationLogCreateData {
  operationDatetime: string;
  operationType: string;
  description?: string;
}

// Lo que ENVIAMOS a la API para ACTUALIZAR
export interface OperationLogUpdateData extends OperationLogCreateData {}