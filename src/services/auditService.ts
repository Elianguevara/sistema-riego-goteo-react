// Archivo: src/services/auditService.ts

import authService from './authService';
import type { ChangeHistoryRequestParams, Page, ChangeHistoryResponse } from '../types/audit.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Obtiene el historial de cambios de la API con filtros y paginación.
 * @param params Objeto con todos los posibles filtros y opciones de paginación.
 * @returns Una promesa que resuelve a un objeto de página con el historial de cambios.
 */
export const getChangeHistory = async (params: ChangeHistoryRequestParams): Promise<Page<ChangeHistoryResponse>> => {
    // Construye los query params dinámicamente
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            queryParams.append(key, String(value));
        }
    });

    const response = await fetch(`${API_BASE_URL}/audit/change-history?${queryParams.toString()}`, {
        method: 'GET',
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('No tienes permiso para acceder al historial de auditoría.');
        }
        throw new Error('Error al obtener el historial de cambios.');
    }

    return response.json();
};

const auditService = {
    getChangeHistory,
};

export default auditService;