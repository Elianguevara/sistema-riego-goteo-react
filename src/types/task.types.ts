// Archivo: src/types/task.types.ts

export type TaskStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA';
export type TaskType = 'RIEGO' | 'MANTENIMIENTO' | 'FERTILIZACION' | 'OTRO';
// --- NUEVO TIPO AÑADIDO ---
export type TaskPriority = 'ALTA' | 'MEDIA' | 'BAJA';

export interface Task {
  id: number;
  description: string;
  status: TaskStatus;
  taskType: TaskType;
  // --- CAMPO AÑADIDO ---
  priority: TaskPriority; 
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

// ... resto del archivo sin cambios
export interface TaskPage {
  content: Task[];
}

export interface TaskStatusUpdateData {
  status: TaskStatus;
}

export interface TaskCreateData {
    description: string;
    assignedToUserId: number;
    sectorId: number;
    farmId?: number; 
    taskType?: TaskType;
}