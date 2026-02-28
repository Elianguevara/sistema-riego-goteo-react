import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import maintenanceService from './maintenanceService';
import authService from './authService';

vi.mock('./authService');

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('maintenanceService', () => {
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

    describe('createMaintenance', () => {
        it('should perform create functionality correctly', async () => {
            const mockRecord = { id: 1, description: 'Fix pipe' };
            setupFetchMock(mockRecord);

            const result = await maintenanceService.createMaintenance(1, 2, { description: 'Fix pipe' } as any);
            expect(result).toEqual(mockRecord);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/farms/1/equipments/2/maintenances'),
                expect.objectContaining({ method: 'POST', body: JSON.stringify({ description: 'Fix pipe' }) })
            );
        });

        it('should throw parsed JSON message on failure', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Cannot create log' }),
            });
            await expect(maintenanceService.createMaintenance(1, 2, {} as any)).rejects.toThrow('Cannot create log');
        });

        it('should throw generic message on failure without valid JSON', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                json: async () => { throw new Error('Not JSON'); },
            });
            await expect(maintenanceService.createMaintenance(1, 2, {} as any)).rejects.toThrow('Error al registrar el mantenimiento.');
        });
    });

    describe('getMaintenancesByEquipment', () => {
        it('should fetch maintenances successfully', async () => {
            const mockData = [{ id: 1, description: 'Fix' }];
            setupFetchMock(mockData);

            const result = await maintenanceService.getMaintenancesByEquipment(1, 2);
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/farms/1/equipments/2/maintenances'),
                expect.objectContaining({ headers: expect.anything() })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(maintenanceService.getMaintenancesByEquipment(1, 2)).rejects.toThrow('Error al obtener el historial de mantenimientos.');
        });
    });
});
