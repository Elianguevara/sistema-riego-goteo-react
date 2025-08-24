// Archivo: src/services/fertilizationService.ts

import authService from './authService';
// Se importan los tipos corregidos que coinciden con la API
import type { FertilizationCreateData, FertilizationRecord } from '../types/fertilization.types';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/fertilization`;

// Helper para obtener las cabeceras de autenticación
const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Registra un nuevo evento de fertilización.
 * Endpoint: POST /api/fertilization
 */
const createFertilizationRecord = async (data: FertilizationCreateData): Promise<FertilizationRecord> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        // Manejo de errores mejorado para dar más contexto
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al registrar la fertilización.');
    }
    return response.json();
};

/**
 * Obtiene todas las fertilizaciones de un sector específico.
 * Endpoint: GET /api/fertilization/sector/{sectorId}
 */
const getFertilizationsBySector = async (sectorId: number): Promise<FertilizationRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/sector/${sectorId}`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        throw new Error('Error al obtener las fertilizaciones del sector.');
    }
    return response.json();
};

/**
 * Actualiza un registro de fertilización existente.
 * Endpoint: PUT /api/fertilization/{fertilizationId}
 */
const updateFertilization = async (fertilizationId: number, data: Partial<FertilizationCreateData>): Promise<FertilizationRecord> => {
    const response = await fetch(`${API_BASE_URL}/${fertilizationId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el registro.');
    }
    return response.json();
};

/**
 * Elimina un registro de fertilización.
 * Endpoint: DELETE /api/fertilization/{fertilizationId}
 */
const deleteFertilization = async (fertilizationId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${fertilizationId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        // El status 204 (No Content) es una respuesta exitosa, !response.ok lo maneja.
        throw new Error('Error al eliminar el registro de fertilización.');
    }
};


const fertilizationService = {
    createFertilizationRecord,
    getFertilizationsBySector,
    updateFertilization,
    deleteFertilization,
};

export default fertilizationService;