import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import fertilizationService from './fertilizationService';
import authService from './authService';

vi.mock('./authService');

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('fertilizationService', () => {
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

    describe('createFertilizationRecord', () => {
        it('should create record successfully', async () => {
            const mockRecord = { id: 1, amount: 10 };
            setupFetchMock(mockRecord);

            const result = await fertilizationService.createFertilizationRecord({ amount: 10 } as any);
            expect(result).toEqual(mockRecord);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/fertilization'),
                expect.objectContaining({ method: 'POST', body: JSON.stringify({ amount: 10 }) })
            );
        });

        it('should throw parsed message on failure', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Custom server error' }),
            });
            await expect(fertilizationService.createFertilizationRecord({} as any)).rejects.toThrow('Custom server error');
        });

        it('should throw generic message on failure without json format', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                json: async () => { throw new Error('Not JSON'); },
            });
            await expect(fertilizationService.createFertilizationRecord({} as any)).rejects.toThrow('Error al registrar la fertilización.');
        });
    });

    describe('getFertilizationsBySector', () => {
        it('should fetch fertilizations by sector', async () => {
            const mockData = [{ id: 1 }];
            setupFetchMock(mockData);

            const result = await fertilizationService.getFertilizationsBySector(1);
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/fertilization/sector/1'),
                expect.objectContaining({ method: 'GET' })
            );
        });

        it('should throw error on fetch failure', async () => {
            setupFetchMock(null, false);
            await expect(fertilizationService.getFertilizationsBySector(1)).rejects.toThrow('Error al obtener las fertilizaciones del sector.');
        });
    });

    describe('updateFertilization', () => {
        it('should update record successfully', async () => {
            const mockRecord = { id: 1, amount: 20 };
            setupFetchMock(mockRecord);

            const result = await fertilizationService.updateFertilization(1, { amount: 20 } as any);
            expect(result).toEqual(mockRecord);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/fertilization/1'),
                expect.objectContaining({ method: 'PUT', body: JSON.stringify({ amount: 20 }) })
            );
        });

        it('should throw error on update failure', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Cannot update' }),
            });
            await expect(fertilizationService.updateFertilization(1, {})).rejects.toThrow('Cannot update');
        });

        it('should throw generic error on update failure if no valid JSON', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                json: async () => { throw new Error('Not JSON'); },
            });
            await expect(fertilizationService.updateFertilization(1, {})).rejects.toThrow('Error al actualizar el registro.');
        });
    });

    describe('deleteFertilization', () => {
        it('should delete record successfully', async () => {
            setupFetchMock(null, true);
            await fertilizationService.deleteFertilization(1);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/fertilization/1'),
                expect.objectContaining({ method: 'DELETE' })
            );
        });

        it('should throw error on delete failure', async () => {
            setupFetchMock(null, false);
            await expect(fertilizationService.deleteFertilization(1)).rejects.toThrow('Error al eliminar el registro de fertilización.');
        });
    });
});
