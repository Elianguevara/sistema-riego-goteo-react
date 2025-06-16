// Archivo: src/services/dashboardService.ts

import authService from './authService';
import type { KpiResponse } from '../types/dashboard.types';

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

const dashboardService = {
    getKpis,
};

export default dashboardService;