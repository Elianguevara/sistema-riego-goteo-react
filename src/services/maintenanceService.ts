// Archivo: src/services/maintenanceService.ts

import authService from './authService';
import type { MaintenanceCreateData, MaintenanceRecord } from '../types/maintenance.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Registra un nuevo mantenimiento para un equipo.
 * POST /api/farms/{farmId}/equipments/{equipmentId}/maintenances
 */
const createMaintenance = async (farmId: number, equipmentId: number, data: MaintenanceCreateData): Promise<MaintenanceRecord> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/equipments/${equipmentId}/maintenances`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al registrar el mantenimiento.');
    }
    return response.json();
};

/**
 * Obtiene la lista de mantenimientos de un equipo.
 * GET /api/farms/{farmId}/equipments/{equipmentId}/maintenances
 */
const getMaintenancesByEquipment = async (farmId: number, equipmentId: number): Promise<MaintenanceRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/equipments/${equipmentId}/maintenances`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        throw new Error('Error al obtener el historial de mantenimientos.');
    }
    return response.json();
};

const maintenanceService = {
    createMaintenance,
    getMaintenancesByEquipment,
};

export default maintenanceService;