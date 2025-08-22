// Archivo: src/services/taskService.ts

import authService from './authService';
import type { Task, TaskPage, TaskStatusUpdateData, TaskCreateData } from '../types/task.types';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/tasks`;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * (OPERARIO) Obtiene las tareas asignadas al operario autenticado.
 * Endpoint: GET /api/tasks/assigned-to-me
 */
const getMyTasks = async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/assigned-to-me`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        throw new Error('Error al obtener las tareas asignadas.');
    }
    
    // --- INICIO DE LA MODIFICACIÓN: Lógica robusta de parseo ---
    try {
        const data = await response.json();
        // Verificamos si la respuesta es un objeto de paginación y tiene contenido
        if (data && Array.isArray(data.content)) {
            return data.content;
        }
        // Verificamos si la respuesta ya es un array
        if (data && Array.isArray(data)) {
            return data;
        }
        // Si la estructura no es la esperada, devolvemos un array vacío para evitar errores.
        console.warn("La respuesta de getMyTasks no tiene el formato esperado:", data);
        return [];
    } catch (error) {
        console.error("Error al parsear la respuesta de getMyTasks:", error);
        // Si hay un error de parseo (ej. respuesta vacía), devolvemos un array vacío.
        return [];
    }
    // --- FIN DE LA MODIFICACIÓN ---
};

/**
 * (OPERARIO) Actualiza el estado de una tarea específica.
 * Endpoint: PUT /api/tasks/{taskId}/status
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
 * (ANALISTA) Obtiene las tareas creadas por el analista autenticado.
 * Endpoint: GET /api/tasks/created-by-me
 */
const getTasksCreatedByMe = async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/created-by-me`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener las tareas creadas.');
    const data: TaskPage | Task[] = await response.json();
    return 'content' in data ? data.content : data;
};

/**
 * (ANALISTA) Crea una nueva tarea.
 * Endpoint: POST /api/tasks
 */
const createTask = async (data: TaskCreateData): Promise<Task> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear la tarea.');
    return response.json();
};


const taskService = {
    getMyTasks,
    updateTaskStatus,
    getTasksCreatedByMe,
    createTask,
};

export default taskService;
