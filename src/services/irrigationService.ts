// Archivo: src/services/irrigationService.ts

import authService from './authService';
import type { MonthlyIrrigationSectorView, IrrigationRecord, IrrigationCreateData, IrrigationUpdateData } from '../types/irrigation.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Obtiene la vista mensual de riegos para una finca.
 * Endpoint: GET /api/farms/{farmId}/irrigations/monthly-view
 */
const getMonthlyIrrigationView = async (farmId: number, year: number, month: number): Promise<MonthlyIrrigationSectorView[]> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/irrigations/monthly-view?year=${year}&month=${month}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        throw new Error('Error al obtener la vista mensual de riegos.');
    }
    return response.json();
};

/**
 * Registra un nuevo evento de riego en un sector.
 * Endpoint: POST /api/farms/{farmId}/sectors/{sectorId}/irrigations
 */
const createIrrigation = async (farmId: number, sectorId: number, data: IrrigationCreateData): Promise<IrrigationRecord> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/sectors/${sectorId}/irrigations`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Error al registrar el riego.');
    }
    return response.json();
};

/**
 * Actualiza un registro de riego existente.
 * Endpoint: PUT /api/irrigations/{irrigationId}
 */
const updateIrrigation = async (irrigationId: number, data: IrrigationUpdateData): Promise<IrrigationRecord> => {
    const response = await fetch(`${API_BASE_URL}/irrigations/${irrigationId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Error al actualizar el riego.');
    }
    return response.json();
};

const irrigationService = {
    getMonthlyIrrigationView,
    createIrrigation,
    updateIrrigation,
};

export default irrigationService;
