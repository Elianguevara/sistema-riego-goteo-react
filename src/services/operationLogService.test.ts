import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import operationLogService from './operationLogService';
import authService from './authService';

vi.mock('./authService');

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('operationLogService', () => {
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

    describe('getOperationLogsByFarm', () => {
        it('should query without type if omitted', async () => {
            const mockData = [{ id: 1 }];
            setupFetchMock(mockData);

            const result = await operationLogService.getOperationLogsByFarm(1);
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringMatching(/\/farms\/1\/operationlogs$/),
                expect.objectContaining({ headers: expect.anything() })
            );
        });

        it('should query with type appended', async () => {
            const mockData = [{ id: 1 }];
            setupFetchMock(mockData);

            await operationLogService.getOperationLogsByFarm(1, 'IRRIGATION');
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('?type=IRRIGATION'),
                expect.objectContaining({ headers: expect.anything() })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(operationLogService.getOperationLogsByFarm(1)).rejects.toThrow('Error al obtener la bitácora de operaciones.');
        });
    });

    describe('createOperationLog', () => {
        it('should create log', async () => {
            const mockData = { id: 1 };
            setupFetchMock(mockData);

            const result = await operationLogService.createOperationLog(1, { notes: 'test' } as any);
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/farms/1/operationlogs'),
                expect.objectContaining({ method: 'POST', body: JSON.stringify({ notes: 'test' }) })
            );
        });

        it('should throw 403 on forbidden', async () => {
            setupFetchMock(null, false, 403);
            await expect(operationLogService.createOperationLog(1, {} as any)).rejects.toThrow('Permiso denegado: No puedes crear entradas en esta bitácora.');
        });

        it('should throw API message else generic on failure', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ message: 'API validation error' })
            });
            await expect(operationLogService.createOperationLog(1, {} as any)).rejects.toThrow('API validation error');
        });

        it('should throw generic message on failure without valid JSON', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => { throw new Error('Not JSON'); },
            });
            await expect(operationLogService.createOperationLog(1, {} as any)).rejects.toThrow('Error al crear la entrada en la bitácora.');
        });
    });

    describe('updateOperationLog', () => {
        it('should update successfully', async () => {
            const mockData = { id: 1, notes: 'new' };
            setupFetchMock(mockData);

            await operationLogService.updateOperationLog(1, { notes: 'new' } as any);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/operationlogs/1'),
                expect.objectContaining({ method: 'PUT', body: JSON.stringify({ notes: 'new' }) })
            );
        });

        it('should throw error on update failure', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => { throw new Error('Not JSON'); },
            });
            await expect(operationLogService.updateOperationLog(1, {} as any)).rejects.toThrow('Error al actualizar la entrada de la bitácora.');
        });
    });

    describe('getOperationTypes', () => {
        it('should get operation types', async () => {
            const mockData = ['IRRIGATION', 'FERTILIZATION'];
            setupFetchMock(mockData);

            const result = await operationLogService.getOperationTypes();
            expect(result).toEqual(mockData);
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(operationLogService.getOperationTypes()).rejects.toThrow('Error al obtener los tipos de operación.');
        });
    });
});
