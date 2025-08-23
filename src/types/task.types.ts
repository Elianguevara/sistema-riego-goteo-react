// Archivo: src/types/task.types.ts

export type TaskStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA';
export type TaskType = 'RIEGO' | 'MANTENIMIENTO' | 'FERTILIZACION' | 'OTRO';

export interface Task {
  id: number;
  description: string;
  status: TaskStatus;
  taskType: TaskType;
  createdAt: string;
  updatedAt: string | null;
  dueDate: string | null;
  farmId: number;
  farmName: string;
  sectorId?: number;
  sectorName?: string;
  equipmentId?: number;
  equipmentName?: string;
  createdByUsername: string;
  assignedToUsername: string;
}

export interface TaskPage {
  content: Task[];
}

export interface TaskStatusUpdateData {
  status: TaskStatus;
}

// --- INTERFAZ CORREGIDA ---
// Ahora solo contiene los campos que el backend necesita para la creación.
export interface TaskCreateData {
    description: string;
    assignedToUserId: number;
    sectorId: number;
    // Campos que el formulario usa pero no se envían directamente en el body
    farmId?: number; 
    taskType?: TaskType;
}