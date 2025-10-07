// Archivo: src/services/dashboardService.ts

import authService from './authService';
import type { KpiResponse, UserStatsResponse } from '../types/dashboard.types';
// Importamos los nuevos tipos que crearemos en el siguiente paso
import type { FarmStatus, WaterBalance, TaskSummary } from '../types/analyst.types';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/dashboard`;
const ANALYST_API_URL = `${API_URL}/analyst`;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// --- Funciones del Dashboard General ---

const getKpis = async (): Promise<KpiResponse> => {
    const response = await fetch(`${API_URL}/kpis`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Error al obtener los KPIs del dashboard.');
    return await response.json();
};

const getUserStats = async (): Promise<UserStatsResponse> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard/user-stats`, { headers: getAuthHeader() });
    if (!response.ok) {
        if (response.status === 403) throw new Error('No tienes permiso para ver estas estadísticas.');
        throw new Error('Error al obtener las estadísticas de usuarios.');
    }
    return await response.json();
};


// --- NUEVAS FUNCIONES PARA EL DASHBOARD DEL ANALISTA ---

/**
 * Obtiene el estado y geolocalización de todas las fincas.
 * GET /api/dashboard/analyst/farm-statuses
 */
const getFarmStatuses = async (): Promise<FarmStatus[]> => {
    const response = await fetch(`${ANALYST_API_URL}/farm-statuses`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Error al obtener el estado de las fincas.');
    return response.json();
};

/**
 * Obtiene el balance hídrico diario para una finca en un rango de fechas.
 * GET /api/dashboard/analyst/water-balance/{farmId}
 */
const getWaterBalance = async (farmId: number, startDate: string, endDate: string): Promise<WaterBalance[]> => {
    const queryParams = new URLSearchParams({ startDate, endDate });
    const response = await fetch(`${ANALYST_API_URL}/water-balance/${farmId}?${queryParams}`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Error al obtener el balance hídrico.');
    return response.json();
};

/**
 * Obtiene un resumen del estado de las tareas creadas por el analista.
 * GET /api/dashboard/analyst/task-summary
 */
const getTaskSummary = async (): Promise<TaskSummary> => {
    const response = await fetch(`${ANALYST_API_URL}/task-summary`, { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Error al obtener el resumen de tareas.');
    return response.json();
};

const dashboardService = {
    getKpis,
    getUserStats,
    // Exportamos las nuevas funciones
    getFarmStatuses,
    getWaterBalance,
    getTaskSummary,
};

export default dashboardService;