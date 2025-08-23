// Archivo: src/services/fertilizationService.ts

import authService from './authService';
import type { FertilizationCreateData, FertilizationRecord } from '../types/fertilization.types';

// ¡CORREGIDO! Apunta a la URL base de fertilización
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/fertilization`;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Registra un nuevo evento de fertilización.
 * Endpoint: POST /api/fertilization
 */
const createFertilizationRecord = async (data: FertilizationCreateData): Promise<FertilizationRecord> => {
    const response = await fetch(API_BASE_URL, { // Usa la URL base correcta
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al registrar la fertilización.');
    }
    return response.json();
};

const fertilizationService = {
    createFertilizationRecord,
};

export default fertilizationService;