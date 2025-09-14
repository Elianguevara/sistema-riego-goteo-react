// Archivo: src/services/farmService.ts

import authService from './authService';
import type { Farm, FarmCreateData, FarmUpdateData, Sector, SectorCreateData, SectorUpdateData, IrrigationEquipment,EquipmentCreateData,EquipmentUpdateData,WaterSource,WaterSourceCreateData,WaterSourceUpdateData} from '../types/farm.types';
import type { UserResponse } from '../types/user.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// --- Operaciones CRUD para Fincas ---
const getFarms = async (): Promise<Farm[]> => {
    const response = await fetch(`${API_BASE_URL}/farms`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener la lista de fincas.');
    return response.json();
};

const createFarm = async (data: FarmCreateData): Promise<Farm> => {
    const response = await fetch(`${API_BASE_URL}/farms`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear la finca.');
    return response.json();
};

const updateFarm = async (id: number, data: FarmUpdateData): Promise<Farm> => {
    const response = await fetch(`${API_BASE_URL}/farms/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar la finca.');
    return response.json();
};

const deleteFarm = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/farms/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al eliminar la finca.');
};

const assignUserToFarm = async (userId: number, farmId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/farms/${farmId}`, {
        method: 'POST',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al asignar el usuario a la finca.');
};

const unassignUserFromFarm = async (userId: number, farmId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/farms/${farmId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al desasignar el usuario de la finca.');
};

const getFarmById = async (id: number): Promise<Farm> => {
    const response = await fetch(`${API_BASE_URL}/farms/${id}`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener los detalles de la finca.');
    return response.json();
};

// --- Operaciones de Sectores, Equipos, etc. ---
const getSectorsByFarm = async (farmId: number): Promise<Sector[]> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/sectors`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener los sectores de la finca.');
    return response.json();
};

const createSector = async (farmId: number, data: SectorCreateData): Promise<Sector> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/sectors`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear el sector.');
    return response.json();
};

const updateSector = async (farmId: number, sectorId: number, data: SectorUpdateData): Promise<Sector> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/sectors/${sectorId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar el sector.');
    return response.json();
};

const deleteSector = async (farmId: number, sectorId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/sectors/${sectorId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al eliminar el sector.');
};

const getEquipmentsByFarm = async (farmId: number): Promise<IrrigationEquipment[]> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/equipments`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener los equipos de la finca.');
    return response.json();
};

const createEquipment = async (farmId: number, data: EquipmentCreateData): Promise<IrrigationEquipment> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/equipments`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear el equipo.');
    return response.json();
};

const updateEquipment = async (farmId: number, equipmentId: number, data: EquipmentUpdateData): Promise<IrrigationEquipment> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/equipments/${equipmentId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar el equipo.');
    return response.json();
};

const deleteEquipment = async (farmId: number, equipmentId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/equipments/${equipmentId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al eliminar el equipo.');
};

const getWaterSourcesByFarm = async (farmId: number): Promise<WaterSource[]> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/watersources`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener las fuentes de agua.');
    return response.json();
};

const createWaterSource = async (farmId: number, data: WaterSourceCreateData): Promise<WaterSource> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/watersources`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear la fuente de agua.');
    return response.json();
};

const updateWaterSource = async (waterSourceId: number, data: WaterSourceUpdateData): Promise<WaterSource> => {
    const response = await fetch(`${API_BASE_URL}/watersources/${waterSourceId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar la fuente de agua.');
    return response.json();
};

const deleteWaterSource = async (waterSourceId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/watersources/${waterSourceId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al eliminar la fuente de agua.');
};

const getAssignedUsers = async (farmId: number): Promise<UserResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/farms/${farmId}/users`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('No tienes permiso para ver los usuarios de esta finca.');
        }
        throw new Error('Error al obtener los usuarios asignados.');
    }
    return response.json();
};

/**
 * Obtiene una lista de todos los sectores activos en todas las fincas.
 * Endpoint: GET /api/sectors/active
 */
const getActiveSectors = async (): Promise<Sector[]> => {
    const response = await fetch(`${API_BASE_URL}/sectors/active`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) {
        throw new Error('Error al obtener los sectores activos.');
    }
    return response.json();
};


const farmService = {
    getFarms,
    createFarm,
    updateFarm,
    deleteFarm,
    getFarmById,
    assignUserToFarm,
    unassignUserFromFarm,
    getSectorsByFarm,
    createSector,
    updateSector,
    deleteSector,
    getEquipmentsByFarm,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    getWaterSourcesByFarm,
    createWaterSource,
    updateWaterSource,
    deleteWaterSource,
    getAssignedUsers,
    getActiveSectors, // Se añade la nueva función al objeto exportado
};

export default farmService;