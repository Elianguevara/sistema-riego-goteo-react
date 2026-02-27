import authService from './authService';
import type { IrrigationSectorSummary, IrrigationTimeseriesData, IrrigationRecordsPage } from '../types/analytics.types';
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/analytics`;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Obtiene el resumen de riego por sector.
 */
const getIrrigationSummary = async (params: { farmId: number; startDate: string; endDate: string; sectorIds?: string; }): Promise<IrrigationSectorSummary[]> => {
    const queryParams = new URLSearchParams({
        farmId: String(params.farmId),
        startDate: params.startDate,
        endDate: params.endDate,
    });
    if (params.sectorIds) {
        queryParams.append('sectorIds', params.sectorIds);
    }
    const response = await fetch(`${API_BASE_URL}/irrigation/summary?${queryParams.toString()}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener el resumen de riego.');
    return response.json();
};

/**
 * Obtiene la serie temporal de riego para un sector.
 */
const getIrrigationTimeseries = async (params: { sectorId: number; startDate: string; endDate: string; }): Promise<IrrigationTimeseriesData[]> => {
    const queryParams = new URLSearchParams({
        sectorId: String(params.sectorId),
        startDate: params.startDate,
        endDate: params.endDate,
    });
    const response = await fetch(`${API_BASE_URL}/irrigation/timeseries?${queryParams.toString()}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener la serie temporal de riego.');
    return response.json();
};

/**
 * Obtiene los registros de riego detallados y paginados.
 */
const getIrrigationRecords = async (params: {
    farmId: number;
    startDate: string;
    endDate: string;
    sectorIds?: string;
    page?: number;
    size?: number;
    sort?: string;
}): Promise<IrrigationRecordsPage> => {
    const queryParams = new URLSearchParams({
        farmId: String(params.farmId),
        startDate: params.startDate,
        endDate: params.endDate,
    });
    if (params.sectorIds) queryParams.append('sectorIds', params.sectorIds);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.size) queryParams.append('size', String(params.size));
    if (params.sort) queryParams.append('sort', params.sort);

    const response = await fetch(`${API_BASE_URL}/irrigation/records?${queryParams.toString()}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al obtener los registros de riego.');
    return response.json();
};


const analyticsService = {
    getIrrigationSummary,
    getIrrigationTimeseries,
    getIrrigationRecords,
};

export default analyticsService;