// Archivo: src/services/precipitationService.ts

import authService from './authService';
import type { PrecipitationCreateData, PrecipitationRecord, PrecipitationSummary } from '../types/precipitation.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// --- CRUD Operations ---

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

/**
 * Actualiza un registro de precipitación.
 * PUT /api/precipitations/{precipitationId}
 */
const updatePrecipitation = async (precipitationId: number, data: PrecipitationCreateData): Promise<PrecipitationRecord> => {
    const response = await fetch(`${API_BASE_URL}/precipitations/${precipitationId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar el registro.');
    return response.json();
};

/**
 * Elimina un registro de precipitación.
 * DELETE /api/precipitations/{precipitationId}
 */
const deletePrecipitation = async (precipitationId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/precipitations/${precipitationId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al eliminar el registro.');
};


// --- Summary Endpoints ---

/**
 * Obtiene el resumen de precipitación mensual.
 * GET /api/farms/{farmId}/precipitations/summary/monthly
 */
const getMonthlySummary = async (farmId: number, year: number, month: number): Promise<PrecipitationSummary> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/precipitations/summary/monthly?year=${year}&month=${month}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener el resumen mensual.');
    return response.json();
}

/**
 * Obtiene el resumen de precipitación anual (campaña de riego).
 * GET /api/farms/{farmId}/precipitations/summary/annual
 */
const getAnnualSummary = async (farmId: number, year: number): Promise<PrecipitationSummary> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/precipitations/summary/annual?year=${year}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener el resumen anual.');
    return response.json();
}


const precipitationService = {
    createPrecipitation,
    getPrecipitationsByFarm,
    updatePrecipitation,
    deletePrecipitation,
    getMonthlySummary,
    getAnnualSummary,
};

export default precipitationService;