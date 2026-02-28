import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import precipitationService from './precipitationService';
import authService from './authService';

vi.mock('./authService');

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('precipitationService', () => {
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

    describe('createPrecipitation', () => {
        it('should create record successfully', async () => {
            const mockRecord = { id: 1, amount: 50 };
            setupFetchMock(mockRecord);

            const result = await precipitationService.createPrecipitation(1, { amount: 50 } as any);
            expect(result).toEqual(mockRecord);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/farms/1/precipitations'),
                expect.objectContaining({ method: 'POST', body: JSON.stringify({ amount: 50 }) })
            );
        });

        it('should throw parsed message on failure', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'API validation error' })
            });
            await expect(precipitationService.createPrecipitation(1, {} as any)).rejects.toThrow('API validation error');
        });

        it('should throw generic message on failure without json', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                json: async () => { throw new Error('Not JSON'); },
            });
            await expect(precipitationService.createPrecipitation(1, {} as any)).rejects.toThrow('Error al registrar la precipitación.');
        });
    });

    describe('getPrecipitationsByFarm', () => {
        it('should fetch records', async () => {
            const mockData = [{ id: 1 }];
            setupFetchMock(mockData);

            await precipitationService.getPrecipitationsByFarm(1);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/farms/1/precipitations'),
                expect.objectContaining({ headers: expect.anything() })
            );
        });

        it('should throw error on fetch failure', async () => {
            setupFetchMock(null, false);
            await expect(precipitationService.getPrecipitationsByFarm(1)).rejects.toThrow('Error al obtener el historial de precipitaciones.');
        });
    });

    describe('updatePrecipitation', () => {
        it('should update successfully', async () => {
            const mockRecord = { id: 1 };
            setupFetchMock(mockRecord);

            await precipitationService.updatePrecipitation(1, { amount: 20 } as any);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/precipitations/1'),
                expect.objectContaining({ method: 'PUT', body: JSON.stringify({ amount: 20 }) })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(precipitationService.updatePrecipitation(1, {} as any)).rejects.toThrow('Error al actualizar el registro.');
        });
    });

    describe('deletePrecipitation', () => {
        it('should delete correctly', async () => {
            setupFetchMock(null, true);
            await precipitationService.deletePrecipitation(1);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/precipitations/1'),
                expect.objectContaining({ method: 'DELETE' })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(precipitationService.deletePrecipitation(1)).rejects.toThrow('Error al eliminar el registro.');
        });
    });

    describe('getMonthlySummary', () => {
        it('should fetch monthly summary correctly', async () => {
            const mockData = { totalRain: 100 };
            setupFetchMock(mockData);

            const result = await precipitationService.getMonthlySummary(1, 2023, 5);
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/farms/1/precipitations/summary/monthly?year=2023&month=5'),
                expect.objectContaining({ headers: expect.anything() })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(precipitationService.getMonthlySummary(1, 2023, 5)).rejects.toThrow('Error al obtener el resumen mensual.');
        });
    });

    describe('getAnnualSummary', () => {
        it('should fetch annual summary correctly', async () => {
            const mockData = { totalRain: 500 };
            setupFetchMock(mockData);

            const result = await precipitationService.getAnnualSummary(1, 2023);
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/farms/1/precipitations/summary/annual?year=2023'),
                expect.objectContaining({ headers: expect.anything() })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(precipitationService.getAnnualSummary(1, 2023)).rejects.toThrow('Error al obtener el resumen anual.');
        });
    });
});
