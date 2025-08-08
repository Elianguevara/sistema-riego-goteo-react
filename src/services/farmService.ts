import authService from './authService';
import type { Farm, FarmCreateData, FarmUpdateData, Sector, SectorCreateData, SectorUpdateData, IrrigationEquipment,EquipmentCreateData,EquipmentUpdateData,WaterSource,WaterSourceCreateData,WaterSourceUpdateData} from '../types/farm.types';// Importa los otros tipos que necesites aquí
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

/**
 * Obtiene una lista de todas las fincas.
 * Endpoint: GET /api/farms
 */
const getFarms = async (): Promise<Farm[]> => {
    const response = await fetch(`${API_BASE_URL}/farms`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener la lista de fincas.');
    return response.json();
};

/**
 * Crea una nueva finca.
 * Endpoint: POST /api/farms
 */
const createFarm = async (data: FarmCreateData): Promise<Farm> => {
    const response = await fetch(`${API_BASE_URL}/farms`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear la finca.');
    return response.json();
};

/**
 * Actualiza una finca existente.
 * Endpoint: PUT /api/farms/{farmId}
 */
const updateFarm = async (id: number, data: FarmUpdateData): Promise<Farm> => {
    const response = await fetch(`${API_BASE_URL}/farms/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar la finca.');
    return response.json();
};

/**
 * Elimina una finca.
 * Endpoint: DELETE /api/farms/{farmId}
 */
const deleteFarm = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/farms/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al eliminar la finca.');
};

// --- Operaciones de Asignación de Usuarios ---

/**
 * Asigna un usuario a una finca.
 * Endpoint: POST /api/admin/users/{userId}/farms/{farmId} (CORREGIDO)
 */
const assignUserToFarm = async (userId: number, farmId: number): Promise<void> => {
    // La URL ha sido corregida para coincidir con tu especificación.
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/farms/${farmId}`, {
        method: 'POST',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al asignar el usuario a la finca.');
};

/**
 * Desasigna un usuario de una finca.
 * Endpoint: DELETE /api/admin/users/{userId}/farms/{farmId}
 */
const unassignUserFromFarm = async (userId: number, farmId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/farms/${farmId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al desasignar el usuario de la finca.');
};
/**
 * Obtiene los detalles de una finca específica.
 * Endpoint: GET /api/farms/{farmId}
 */
const getFarmById = async (id: number): Promise<Farm> => {
    const response = await fetch(`${API_BASE_URL}/farms/${id}`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener los detalles de la finca.');
    return response.json();
};

// --- Operaciones CRUD para Sectores ---

/**
 * Obtiene la lista de sectores de una finca.
 * Endpoint: GET /api/farms/{farmId}/sectors
 */
const getSectorsByFarm = async (farmId: number): Promise<Sector[]> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/sectors`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener los sectores de la finca.');
    return response.json();
};

/**
 * Crea un nuevo sector en una finca.
 * Endpoint: POST /api/farms/{farmId}/sectors
 */
const createSector = async (farmId: number, data: SectorCreateData): Promise<Sector> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/sectors`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear el sector.');
    return response.json();
};

/**
 * Actualiza un sector existente.
 * Endpoint: PUT /api/farms/{farmId}/sectors/{sectorId}
 */
const updateSector = async (farmId: number, sectorId: number, data: SectorUpdateData): Promise<Sector> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/sectors/${sectorId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar el sector.');
    return response.json();
};

/**
 * Elimina un sector.
 * Endpoint: DELETE /api/farms/{farmId}/sectors/{sectorId}
 */
const deleteSector = async (farmId: number, sectorId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/sectors/${sectorId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al eliminar el sector.');
};

// --- Operaciones para Equipos (lo necesitaremos para el formulario de Sectores) ---

/**
 * Obtiene la lista de equipos de una finca.
 * Endpoint: GET /api/farms/{farmId}/equipments
 */
const getEquipmentsByFarm = async (farmId: number): Promise<IrrigationEquipment[]> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/equipments`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener los equipos de la finca.');
    return response.json();
};
/**
 * Crea un nuevo equipo en una finca.
 * Endpoint: POST /api/farms/{farmId}/equipments
 */
const createEquipment = async (farmId: number, data: EquipmentCreateData): Promise<IrrigationEquipment> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/equipments`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear el equipo.');
    return response.json();
};

/**
 * Actualiza un equipo existente.
 * Endpoint: PUT /api/farms/{farmId}/equipments/{equipmentId}
 */
const updateEquipment = async (farmId: number, equipmentId: number, data: EquipmentUpdateData): Promise<IrrigationEquipment> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/equipments/${equipmentId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar el equipo.');
    return response.json();
};

/**
 * Elimina un equipo de una finca.
 * Endpoint: DELETE /api/farms/{farmId}/equipments/{equipmentId}
 */
const deleteEquipment = async (farmId: number, equipmentId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/equipments/${equipmentId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al eliminar el equipo.');
};

/**
 * Obtiene la lista de fuentes de agua de una finca.
 * Endpoint: GET /api/farms/{farmId}/watersources
 */
const getWaterSourcesByFarm = async (farmId: number): Promise<WaterSource[]> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/watersources`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener las fuentes de agua.');
    return response.json();
};

/**
 * Crea una nueva fuente de agua en una finca.
 * Endpoint: POST /api/farms/{farmId}/watersources
 */
const createWaterSource = async (farmId: number, data: WaterSourceCreateData): Promise<WaterSource> => {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}/watersources`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear la fuente de agua.');
    return response.json();
};

/**
 * Actualiza una fuente de agua.
 * Endpoint: PUT /api/watersources/{waterSourceId}
 */
const updateWaterSource = async (waterSourceId: number, data: WaterSourceUpdateData): Promise<WaterSource> => {
    const response = await fetch(`${API_BASE_URL}/watersources/${waterSourceId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar la fuente de agua.');
    return response.json();
};

/**
 * Elimina una fuente de agua.
 * Endpoint: DELETE /api/watersources/{waterSourceId}
 */
const deleteWaterSource = async (waterSourceId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/watersources/${waterSourceId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al eliminar la fuente de agua.');
};

/**
 * Obtiene la lista de usuarios asignados a una finca.
 * Endpoint: GET /api/admin/farms/{farmId}/users (ASUMIDO)
 */
const getAssignedUsers = async (farmId: number): Promise<UserResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/farms/${farmId}/users`, {
        method: 'GET',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener los usuarios asignados.');
    return response.json();
};


// Aquí podrías añadir las funciones para Sectores, Equipos, etc.
// Por ahora, nos enfocamos en el CRUD de Fincas.

const farmService = {
    // ... (métodos existentes de fincas y usuarios)
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
    getAssignedUsers, // <-- Añadir
    
};

export default farmService;