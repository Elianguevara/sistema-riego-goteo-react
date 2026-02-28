import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import notificationService from './notificationService';
import authService from './authService';

vi.mock('./authService');

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('notificationService', () => {
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

    describe('getNotifications', () => {
        it('should fetch notifications with default pagination', async () => {
            const mockData = { content: [], totalElements: 0 };
            setupFetchMock(mockData);

            const result = await notificationService.getNotifications();
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/notifications?page=0&size=10&sort=createdAt,desc'),
                expect.objectContaining({ headers: expect.objectContaining({ 'Authorization': 'Bearer mock-token' }) })
            );
        });

        it('should fetch notifications with specific pagination', async () => {
            const mockData = { content: [], totalElements: 0 };
            setupFetchMock(mockData);

            await notificationService.getNotifications(2, 50);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/notifications?page=2&size=50&sort=createdAt,desc'),
                expect.objectContaining({ headers: expect.anything() })
            );
        });

        it('should throw error on fetch failure', async () => {
            setupFetchMock(null, false);
            await expect(notificationService.getNotifications()).rejects.toThrow('Error al obtener las notificaciones.');
        });
    });

    describe('getUnreadCount', () => {
        it('should fetch unread count', async () => {
            const mockData = { unreadCount: 5 };
            setupFetchMock(mockData);

            const result = await notificationService.getUnreadCount();
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/notifications/unread-count'),
                expect.objectContaining({ headers: expect.anything() })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(notificationService.getUnreadCount()).rejects.toThrow('Error al obtener el conteo de notificaciones.');
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read on 204 response', async () => {
            setupFetchMock(null, true, 204);

            await notificationService.markAsRead(1);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/notifications/1/read'),
                expect.objectContaining({ method: 'PUT', headers: expect.anything() })
            );
        });

        it('should throw error when not 204', async () => {
            setupFetchMock(null, true, 200); // ok is true, but status is 200 not 204
            await expect(notificationService.markAsRead(1)).rejects.toThrow('Error al marcar la notificación como leída.');
        });

        it('should throw error on fetch failure', async () => {
            setupFetchMock(null, false, 500);
            await expect(notificationService.markAsRead(1)).rejects.toThrow('Error al marcar la notificación como leída.');
        });
    });
});
