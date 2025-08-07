// Archivo: src/services/dashboardService.ts

import authService from './authService';
import type { KpiResponse, UserStatsResponse } from '../types/dashboard.types';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/dashboard`;

/**
 * Obtiene las cabeceras de autenticación necesarias para las peticiones.
 */
const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Obtiene los KPIs (Key Performance Indicators) desde la API.
 */
const getKpis = async (): Promise<KpiResponse> => {
    const response = await fetch(`${API_URL}/kpis`, {
        method: 'GET',
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        throw new Error('Error al obtener los KPIs del dashboard.');
    }

    return await response.json();
};

/**
 * NUEVA FUNCIÓN
 * Obtiene las estadísticas de usuarios desde la API.
 * Endpoint: GET /api/admin/dashboard/user-stats
 */
const getUserStats = async (): Promise<UserStatsResponse> => {
    // Usamos la URL base del entorno y la ruta específica del endpoint
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard/user-stats`, {
        method: 'GET',
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        // Manejo específico para el error de autorización
        if (response.status === 403) {
            throw new Error('No tienes permiso para ver estas estadísticas.');
        }
        throw new Error('Error al obtener las estadísticas de usuarios.');
    }

    return await response.json();
};


const dashboardService = {
    getKpis,
    getUserStats, // 2. Exporta la nueva función
};

export default dashboardService;