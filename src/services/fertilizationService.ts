// src/services/fertilizationService.ts

import authService from './authService';
import type { FertilizationRequest, FertilizationResponse } from '../types/fertilization.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper para obtener las cabeceras de autenticación.
// En una futura refactorización, esto podría moverse a un módulo API centralizado.
const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Obtiene todas las fertilizaciones de un sector específico.
 * GET /api/fertilization/sector/{sectorId}
 */
const getFertilizationsBySector = async (sectorId: number): Promise<FertilizationResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/fertilization/sector/${sectorId}`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        throw new Error('Error al obtener las fertilizaciones del sector.');
    }
    return response.json();
};

/**
 * Crea un nuevo registro de fertilización.
 * POST /api/fertilization
 */
const createFertilization = async (data: FertilizationRequest): Promise<FertilizationResponse> => {
    const response = await fetch(`${API_BASE_URL}/fertilization`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        // Se podría mejorar para leer el cuerpo del error de la API y dar un mensaje más específico.
        throw new Error('Error al crear el registro de fertilización.');
    }
    return response.json();
};

/**
 * Actualiza un registro de fertilización existente.
 * PUT /api/fertilization/{fertilizationId}
 */
const updateFertilization = async (fertilizationId: number, data: Partial<FertilizationRequest>): Promise<FertilizationResponse> => {
    const response = await fetch(`${API_BASE_URL}/fertilization/${fertilizationId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Error al actualizar el registro de fertilización.');
    }
    return response.json();
};

/**
 * Elimina un registro de fertilización.
 * DELETE /api/fertilization/{fertilizationId}
 */
const deleteFertilization = async (fertilizationId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/fertilization/${fertilizationId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });

    // El backend devuelve 204 No Content, que no tiene cuerpo.
    // response.ok es true para 204, pero si hay otro error (404, 403), !response.ok será true.
    if (!response.ok) {
        throw new Error('Error al eliminar el registro de fertilización.');
    }
};

const fertilizationService = {
    getFertilizationsBySector,
    createFertilization,
    updateFertilization,
    deleteFertilization,
};

export default fertilizationService;
