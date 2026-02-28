import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import * as apiUsers from './apiUsers';
import authService from './authService';

vi.mock('./authService');

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('apiUsers', () => {
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
        });
    };

    describe('getUsers', () => {
        it('should fetch users list correctly', async () => {
            const mockUsers = [{ id: 1, name: 'Admin' }];
            setupFetchMock(mockUsers);

            const result = await apiUsers.getUsers();
            expect(result).toEqual(mockUsers);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/admin/users'),
                expect.objectContaining({ headers: { 'Authorization': 'Bearer mock-token' } })
            );
        });

        it('should throw error on fetch failure', async () => {
            setupFetchMock(null, false);
            await expect(apiUsers.getUsers()).rejects.toThrow('No se pudieron cargar los usuarios.');
        });
    });

    describe('createUser', () => {
        it('should create user correctly', async () => {
            const mockUser = { id: 1, name: 'New User' };
            setupFetchMock(mockUser);

            const result = await apiUsers.createUser({ name: 'New User' } as any);
            expect(result).toEqual(mockUser);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/admin/users'),
                expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'New User' }) })
            );
        });

        it('should throw error with API message on failure', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Custom error message' }),
            });
            await expect(apiUsers.createUser({} as any)).rejects.toThrow('Custom error message');
        });

        it('should throw generic error on failure without message', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                json: async () => ({}),
            });
            await expect(apiUsers.createUser({} as any)).rejects.toThrow('No se pudo crear el usuario.');
        });
    });

    describe('updateUser', () => {
        it('should update user correctly', async () => {
            const mockUser = { id: 1, name: 'Updated' };
            setupFetchMock(mockUser);

            const result = await apiUsers.updateUser(1, { name: 'Updated' } as any);
            expect(result).toEqual(mockUser);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/admin/users/1'),
                expect.objectContaining({ method: 'PUT', body: JSON.stringify({ name: 'Updated' }) })
            );
        });

        it('should throw generic error on failure', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                json: async () => ({}),
            });
            await expect(apiUsers.updateUser(1, {} as any)).rejects.toThrow('No se pudo actualizar el usuario.');
        });
    });

    describe('deleteUser', () => {
        it('should delete user correctly', async () => {
            setupFetchMock(null, true);
            await apiUsers.deleteUser(1);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/admin/users/1'),
                expect.objectContaining({ method: 'DELETE' })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(apiUsers.deleteUser(1)).rejects.toThrow('No se pudo eliminar el usuario.');
        });
    });

    describe('updateUserStatus', () => {
        it('should apply patch status correctly', async () => {
            setupFetchMock(null, true);
            await apiUsers.updateUserStatus(1, { active: true });
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/admin/users/1/status'),
                expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ active: true }) })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(apiUsers.updateUserStatus(1, { active: true })).rejects.toThrow('No se pudo actualizar el estado del usuario.');
        });
    });

    describe('updateUserPasswordByAdmin', () => {
        it('should apply patch password correctly', async () => {
            setupFetchMock(null, true);
            await apiUsers.updateUserPasswordByAdmin(1, { newPassword: 'abc' });
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/admin/users/1/password'),
                expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ newPassword: 'abc' }) })
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(apiUsers.updateUserPasswordByAdmin(1, { newPassword: 'abc' })).rejects.toThrow('No se pudo actualizar la contraseña del usuario.');
        });
    });
});
