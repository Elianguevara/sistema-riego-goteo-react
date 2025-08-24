// Archivo: src/services/precipitationService.ts

import authService from './authService';
import type { PrecipitationCreateData, PrecipitationRecord } from '../types/precipitation.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Registra una nueva precipitación para una finca.
 * POST /api/farms/{farmId}/precipitations
 */
const createPrecipitation = async (farmId: number, data: PrecipitationCreateData): Promise<PrecipitationRecord> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/precipitations`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al registrar la precipitación.');
    }
    return response.json();
};

/**
 * Obtiene la lista de precipitaciones de una finca.
 * GET /api/farms/{farmId}/precipitations
 */
const getPrecipitationsByFarm = async (farmId: number): Promise<PrecipitationRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/precipitations`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        throw new Error('Error al obtener el historial de precipitaciones.');
    }
    return response.json();
};

const precipitationService = {
    createPrecipitation,
    getPrecipitationsByFarm,
};

export default precipitationService;