// Archivo: src/services/operationLogService.ts

import authService from './authService';
import type { OperationLog, OperationLogCreateData, OperationLogUpdateData } from '../types/operationLog.types';

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

    // --- MANEJO DE ERRORES MEJORADO ---
    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('Permiso denegado: No puedes crear entradas en esta bitácora.');
        }
        try {
            const errorData = await response.json();
            // Si el backend envía un mensaje de error específico, lo mostramos
            throw new Error(errorData.message || 'Error al crear la entrada en la bitácora.');
        } catch (e) {
            // Si la respuesta de error no es un JSON, mostramos un error genérico
            throw new Error(`Error del servidor: ${response.status}. Intenta de nuevo más tarde.`);
        }
    }
    return response.json();
};


/**
 * Obtiene un registro específico por su ID.
 * GET /api/operationlogs/{logId}
 */
const getOperationLogById = async (logId: number): Promise<OperationLog> => {
    const response = await fetch(`${API_BASE_URL}/operationlogs/${logId}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        throw new Error('Error al obtener el detalle del registro.');
    }
    return response.json();
};

/**
 * Actualiza una entrada existente en la bitácora.
 * PUT /api/operationlogs/{logId}
 */
const updateOperationLog = async (logId: number, data: OperationLogUpdateData): Promise<OperationLog> => {
    const response = await fetch(`${API_BASE_URL}/operationlogs/${logId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar la entrada de la bitácora.');
    }
    return response.json();
};


const operationLogService = {
    getOperationLogsByFarm,
    createOperationLog,
    getOperationLogById,
    updateOperationLog,
};

export default operationLogService;