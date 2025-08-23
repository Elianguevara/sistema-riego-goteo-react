// Archivo: src/types/task.types.ts

export type TaskStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA';
export type TaskType = 'RIEGO' | 'MANTENIMIENTO' | 'FERTILIZACION' | 'OTRO';

export interface Task {
  id: number;
  description: string;
  status: TaskStatus;
  taskType: TaskType; // Este campo no está en tu nuevo JSON, pero lo mantenemos por si se usa en otros lados.
  createdAt: string;
  updatedAt: string | null;
  dueDate: string | null;

  // --- CAMPOS AÑADIDOS/ACTUALIZADOS ---
  farmId: number;
  farmName: string;
  sectorId?: number; // Opcional por si una tarea es a nivel de finca
  sectorName?: string; // Opcional
  equipmentId?: number;
  equipmentName?: string;
  
  // Nuevos campos de la respuesta del backend
  createdByUsername: string;
  assignedToUsername: string;
}

export interface TaskPage {
  content: Task[];
}

export interface TaskStatusUpdateData {
  status: TaskStatus;
}

export interface TaskCreateData {
    description: string;
    taskType: TaskType;
    assignedToUserId: number;
    farmId: number;
    sectorId?: number;
    equipmentId?: number;
    dueDate?: string;
}