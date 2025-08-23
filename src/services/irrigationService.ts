// Archivo: src/services/irrigationService.ts

import authService from './authService';
import type { MonthlyIrrigationSectorView, IrrigationRecord, IrrigationCreateData } from '../types/irrigation.types';

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
 * ¡MODIFICADO!
 * Registra un nuevo evento de riego.
 * Endpoint: POST /api/irrigation
 */
const createIrrigation = async (data: IrrigationCreateData): Promise<IrrigationRecord> => {
    const response = await fetch(`${API_BASE_URL}/irrigation`, { // Apunta al nuevo endpoint
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data), // Envía la nueva estructura de datos
    });

    if (!response.ok) {
        // Mejor manejo de errores para dar más contexto
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al registrar el riego.' }));
        throw new Error(errorData.message || 'Error al registrar el riego.');
    }
    return response.json();
};


const irrigationService = {
    getMonthlyIrrigationView,
    createIrrigation,
};

export default irrigationService;