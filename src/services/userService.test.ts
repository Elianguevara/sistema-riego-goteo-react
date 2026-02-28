import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import userService from './userService';
import authService from './authService';

vi.mock('./authService');

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('userService', () => {
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
            text: async () => (typeof data === 'string' ? data : JSON.stringify(data)),
            status: ok ? 200 : 400,
        });
    };

    describe('getMyProfile', () => {
        it('should fetch the user profile', async () => {
            const mockProfile = { id: 1, name: 'John Doe', email: 'john@example.com' };
            setupFetchMock(mockProfile);

            const result = await userService.getMyProfile();

            expect(result).toEqual(mockProfile);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/me'),
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer mock-token',
                        'Content-Type': 'application/json'
                    })
                })
            );
        });

        it('should throw an error on failure', async () => {
            setupFetchMock(null, false);
            await expect(userService.getMyProfile()).rejects.toThrow('Error al obtener los datos del perfil.');
        });
    });

    describe('updateMyProfile', () => {
        it('should update the user profile', async () => {
            const mockData = { name: 'Jane Doe', email: 'jane@example.com' };
            const mockResponse = { id: 1, ...mockData };
            setupFetchMock(mockResponse);

            const result = await userService.updateMyProfile(mockData as any);

            expect(result).toEqual(mockResponse);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/me/profile'),
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(mockData)
                })
            );
        });

        it('should throw an error on update failure', async () => {
            setupFetchMock(null, false);
            await expect(userService.updateMyProfile({ name: 'Jane Doe' } as any)).rejects.toThrow('Error al actualizar el perfil.');
        });
    });

    describe('changeMyPassword', () => {
        it('should change the user password', async () => {
            const mockResponse = 'Password updated successfully';
            setupFetchMock(mockResponse);

            const mockData = { currentPassword: 'old', newPassword: 'new' };
            const result = await userService.changeMyPassword(mockData);

            expect(result).toBe(mockResponse);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/me/password'),
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(mockData)
                })
            );
        });

        it('should throw an error with text from response on failure', async () => {
            setupFetchMock('Incorrect current password', false);
            await expect(userService.changeMyPassword({ currentPassword: 'wrong', newPassword: 'new' })).rejects.toThrow('Incorrect current password');
        });

        it('should throw a default error on failure when no text is provided', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                text: async () => ''
            });

            await expect(userService.changeMyPassword({ currentPassword: 'wrong', newPassword: 'new' })).rejects.toThrow('Error al cambiar la contraseña.');
        });
    });
});
