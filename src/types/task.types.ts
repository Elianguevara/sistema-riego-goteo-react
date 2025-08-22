// Archivo: src/types/task.types.ts

export type TaskStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA';
export type TaskType = 'RIEGO' | 'MANTENIMIENTO' | 'FERTILIZACION' | 'OTRO';

export interface Task {
  id: number;
  description: string;
  status: TaskStatus;
  taskType: TaskType;
  createdAt: string;
  dueDate: string | null;
  farmId: number;
  farmName: string;
  sectorId?: number;
  sectorName?: string;
  equipmentId?: number;
  equipmentName?: string;
}

export interface TaskPage {
  content: Task[];
}

export interface TaskStatusUpdateData {
  status: TaskStatus;
}

// NUEVA INTERFAZ para crear una tarea
export interface TaskCreateData {
    description: string;
    taskType: TaskType;
    assignedToUserId: number;
    farmId: number;
    sectorId?: number;
    equipmentId?: number;
    dueDate?: string;
}
