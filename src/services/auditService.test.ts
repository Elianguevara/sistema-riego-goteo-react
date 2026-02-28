import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import auditService from './auditService';
import authService from './authService';

vi.mock('./authService');

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('auditService', () => {
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

    describe('getChangeHistory', () => {
        it('should fetch history with filters properly applied', async () => {
            const mockData = { content: [], totalElements: 0 };
            setupFetchMock(mockData);

            await auditService.getChangeHistory({ page: 1, size: 20, entityName: 'User' } as any);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/audit/change-history?page=1&size=20&entityName=User'),
                expect.objectContaining({ headers: expect.objectContaining({ 'Authorization': 'Bearer mock-token' }) })
            );
        });

        it('should ignore empty string, null, and undefined filters', async () => {
            const mockData = { content: [], totalElements: 0 };
            setupFetchMock(mockData);

            await auditService.getChangeHistory({ page: 0, changedByUsername: '', actionType: undefined } as any);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/audit/change-history?page=0'),
                expect.objectContaining({ method: 'GET' })
            );
        });

        it('should throw 403 error', async () => {
            setupFetchMock(null, false, 403);
            await expect(auditService.getChangeHistory({})).rejects.toThrow('No tienes permiso para acceder al historial de auditoría.');
        });

        it('should throw generic error', async () => {
            setupFetchMock(null, false, 500);
            await expect(auditService.getChangeHistory({})).rejects.toThrow('Error al obtener el historial de cambios.');
        });
    });
});
