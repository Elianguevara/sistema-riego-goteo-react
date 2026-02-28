import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import dashboardService from './dashboardService';
import authService from './authService';

vi.mock('./authService');

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('dashboardService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (authService.getToken as Mock).mockReturnValue('mock-token');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const setupFetchMock = (data: any, ok: boolean = true, status: number = 200) => {
        fetchMock.mockResolvedValueOnce({
            ok,
            json: async () => data,
            status,
        });
    };

    describe('getKpis', () => {
        it('should fetch KPIs correctly', async () => {
            const mockData = { totalFarms: 5 };
            setupFetchMock(mockData);

            const result = await dashboardService.getKpis();
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/dashboard/kpis'),
                expect.objectContaining({ headers: expect.objectContaining({ 'Authorization': 'Bearer mock-token' }) })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(dashboardService.getKpis()).rejects.toThrow('Error al obtener los KPIs del dashboard.');
        });
    });

    describe('getUserStats', () => {
        it('should fetch user stats correctly', async () => {
            const mockData = { totalUsers: 10 };
            setupFetchMock(mockData);

            const result = await dashboardService.getUserStats();
            expect(result).toEqual(mockData);
        });

        it('should throw forbidden 403 error', async () => {
            setupFetchMock(null, false, 403);
            await expect(dashboardService.getUserStats()).rejects.toThrow('No tienes permiso para ver estas estadísticas.');
        });

        it('should throw generic error on other failure', async () => {
            setupFetchMock(null, false, 500);
            await expect(dashboardService.getUserStats()).rejects.toThrow('Error al obtener las estadísticas de usuarios.');
        });
    });

    describe('getFarmStatuses', () => {
        it('should fetch farm statuses correctly', async () => {
            const mockData = [{ farmId: 1, lat: 0, lng: 0 }];
            setupFetchMock(mockData);

            const result = await dashboardService.getFarmStatuses();
            expect(result).toEqual(mockData);
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(dashboardService.getFarmStatuses()).rejects.toThrow('Error al obtener el estado de las fincas.');
        });
    });

    describe('getWaterBalance', () => {
        it('should fetch water balance correctly', async () => {
            const mockData = [{ date: '2023-01-01', balance: 0 }];
            setupFetchMock(mockData);

            const result = await dashboardService.getWaterBalance(1, '2023-01-01', '2023-01-31');
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/dashboard/analyst/water-balance/1?startDate=2023-01-01&endDate=2023-01-31'),
                expect.objectContaining({ headers: expect.anything() })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(dashboardService.getWaterBalance(1, '2023-01-01', '2023-01-31')).rejects.toThrow('Error al obtener el balance hídrico.');
        });
    });

    describe('getTaskSummary', () => {
        it('should fetch task summary correctly', async () => {
            const mockData = { completed: 5, pending: 2 };
            setupFetchMock(mockData);

            const result = await dashboardService.getTaskSummary();
            expect(result).toEqual(mockData);
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(dashboardService.getTaskSummary()).rejects.toThrow('Error al obtener el resumen de tareas.');
        });
    });
});
