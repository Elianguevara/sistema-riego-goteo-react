import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import analyticsService from './analyticsService';
import authService from './authService';

vi.mock('./authService');

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('analyticsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (authService.getToken as Mock).mockReturnValue('mock-token');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const setupFetchMock = (data: any, ok: boolean = true) => {
        fetchMock.mockResolvedValueOnce({
            ok,
            json: async () => data,
            status: ok ? 200 : 400,
        });
    };

    describe('getIrrigationSummary', () => {
        it('should fetch irrigation summary correctly', async () => {
            const mockData = [{ sectorId: 1, totalIrrigation: 100 }];
            setupFetchMock(mockData);

            const params = { farmId: 1, startDate: '2023-01-01', endDate: '2023-01-31', sectorIds: '1,2' };
            const result = await analyticsService.getIrrigationSummary(params);

            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/analytics/irrigation/summary?farmId=1&startDate=2023-01-01&endDate=2023-01-31&sectorIds=1%2C2'),
                expect.objectContaining({ headers: expect.objectContaining({ 'Authorization': 'Bearer mock-token' }) })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(analyticsService.getIrrigationSummary({ farmId: 1, startDate: '2023-01-01', endDate: '2023-01-31' })).rejects.toThrow('Error al obtener el resumen de riego.');
        });
    });

    describe('getIrrigationTimeseries', () => {
        it('should fetch irrigation timeseries correctly', async () => {
            const mockData = [{ date: '2023-01-01', amount: 50 }];
            setupFetchMock(mockData);

            const params = { sectorId: 1, startDate: '2023-01-01', endDate: '2023-01-31' };
            const result = await analyticsService.getIrrigationTimeseries(params);

            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/analytics/irrigation/timeseries?sectorId=1&startDate=2023-01-01&endDate=2023-01-31'),
                expect.objectContaining({ headers: expect.anything() })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(analyticsService.getIrrigationTimeseries({ sectorId: 1, startDate: '2023-01-01', endDate: '2023-01-31' })).rejects.toThrow('Error al obtener la serie temporal de riego.');
        });
    });

    describe('getIrrigationRecords', () => {
        it('should fetch irrigation records correctly with all params', async () => {
            const mockData = { content: [], totalElements: 0 };
            setupFetchMock(mockData);

            const params = { farmId: 1, startDate: '2023-01-01', endDate: '2023-01-31', sectorIds: [1], page: 0, size: 10, sort: 'date,desc' };
            const result = await analyticsService.getIrrigationRecords(params as any);

            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringMatching(/analytics\/irrigation\/records\?farmId=1&startDate=2023-01-01&endDate=2023-01-31(&.*)+/),
                expect.objectContaining({ headers: expect.anything() })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(analyticsService.getIrrigationRecords({ farmId: 1, startDate: '2023-01-01', endDate: '2023-01-31' })).rejects.toThrow('Error al obtener los registros de riego.');
        });
    });
});
