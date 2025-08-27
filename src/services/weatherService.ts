// Archivo: src/services/weatherService.ts

import authService from './authService';
import type { CurrentWeather } from '../types/weather.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Obtiene el clima actual para una finca específica.
 * Endpoint: GET /api/farms/{farmId}/weather/current
 */
const getCurrentWeather = async (farmId: number): Promise<CurrentWeather> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/weather/current`, {
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        if (response.status === 409) { // Conflicto: Finca sin coordenadas
            const errorData = await response.json();
            throw new Error(errorData.message || 'La finca no tiene coordenadas para consultar el clima.');
        }
        throw new Error('Error al obtener los datos del clima.');
    }
    return response.json();
};

const weatherService = {
    getCurrentWeather,
};

export default weatherService;