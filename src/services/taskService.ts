// Archivo: src/services/taskService.ts

import authService from './authService';
import type { Task, TaskPage, TaskStatusUpdateData, TaskCreateData } from '../types/task.types';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/tasks`;

// Define una interfaz para los filtros que podemos pasar
export interface TaskFilters {
    status?: string;
    farmId?: string;
    assignedToUserId?: string;
}

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * (OPERARIO) Obtiene las tareas asignadas al operario autenticado.
 */
const getMyTasks = async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/assigned-to-me`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Error al obtener las tareas asignadas.');
    
    const data = await response.json();
    if (data && Array.isArray(data.content)) return data.content;
    if (data && Array.isArray(data)) return data;
    return [];
};

/**
 * (OPERARIO) Actualiza el estado de una tarea específica.
 */
const updateTaskStatus = async (taskId: number, data: TaskStatusUpdateData): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/${taskId}/status`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar el estado de la tarea.');
    return response.json();
};

/**
 * (ANALISTA) Obtiene las tareas creadas por el analista autenticado, con filtros.
 */
const getTasksCreatedByMe = async (filters: TaskFilters = {}): Promise<Task[]> => {
    const queryParams = new URLSearchParams();
    if (filters.status && filters.status !== 'TODOS') queryParams.append('status', filters.status);
    if (filters.farmId && filters.farmId !== 'TODAS') queryParams.append('farmId', filters.farmId);
    if (filters.assignedToUserId && filters.assignedToUserId !== 'TODOS') queryParams.append('userId', filters.assignedToUserId);

    const response = await fetch(`${API_BASE_URL}/created-by-me?${queryParams.toString()}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener las tareas creadas.');
    const data: TaskPage | Task[] = await response.json();
    return 'content' in data ? data.content : data;
};

/**
 * (ANALISTA) Crea una nueva tarea.
 */
const createTask = async (data: TaskCreateData): Promise<Task> => {
    const requestBody = {
        description: data.description,
        assignedToUserId: data.assignedToUserId,
        sectorId: data.sectorId
    };

    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.message || 'Error al crear la tarea.');
        } catch (e) {
            throw new Error('El servidor tuvo un problema. Contacta al administrador.');
        }
    }
    return response.json();
};


const taskService = {
    getMyTasks,
    updateTaskStatus,
    getTasksCreatedByMe,
    createTask,
};

export default taskService;