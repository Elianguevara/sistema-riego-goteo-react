// Archivo: src/types/operationLog.types.ts

// Lo que RECIBIMOS de la API (OperationLogResponse)
export interface OperationLog {
  id: number;
  farmId: number;
  farmName: string;
  logDate: string; // Formato YYYY-MM-DD
  description: string;
  createdByUsername: string;
}

// Lo que ENVIAMOS a la API para crear un registro
export interface OperationLogCreateData {
  logDate: string; // Formato YYYY-MM-DD
  description: string;
}