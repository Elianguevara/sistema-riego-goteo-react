// Archivo: src/services/operationLogService.ts

import authService from './authService';
// Asegúrate de crear este archivo de tipos en el siguiente paso
import type { OperationLog, OperationLogCreateData } from '../types/operationLog.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Obtiene la bitácora de operaciones de una finca.
 * GET /api/farms/{farmId}/operationlogs
 */
const getOperationLogsByFarm = async (farmId: number): Promise<OperationLog[]> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/operationlogs`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        throw new Error('Error al obtener la bitácora de operaciones.');
    }
    return response.json();
};

/**
 * Crea una nueva entrada en la bitácora de operaciones.
 * POST /api/farms/{farmId}/operationlogs
 */
const createOperationLog = async (farmId: number, data: OperationLogCreateData): Promise<OperationLog> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/operationlogs`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear la entrada en la bitácora.');
    }
    return response.json();
};

const operationLogService = {
    getOperationLogsByFarm,
    createOperationLog,
};

export default operationLogService;