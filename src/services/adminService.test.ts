import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import adminService from './adminService';
import authService from './authService';

vi.mock('./authService');

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('adminService', () => {
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

    describe('getUsers', () => {
        it('should fetch users with default pagination', async () => {
            const mockPage = { content: [{ id: 1, name: 'User 1' }], totalElements: 1 };
            setupFetchMock(mockPage);

            const result = await adminService.getUsers();

            expect(result).toEqual(mockPage);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/admin/users?page=0&size=10&sort=name%2Casc'),
                expect.objectContaining({ method: 'GET', headers: expect.anything() })
            );
        });

        it('should fetch users with custom pagination', async () => {
            const mockPage = { content: [], totalElements: 0 };
            setupFetchMock(mockPage);

            await adminService.getUsers({ page: 2, size: 20, sort: 'email,desc' });

            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/admin/users?page=2&size=20&sort=email%2Cdesc'),
                expect.objectContaining({ method: 'GET' })
            );
        });

        it('should throw error on fetch failure', async () => {
            setupFetchMock(null, false);
            await expect(adminService.getUsers()).rejects.toThrow('Error al obtener la lista de usuarios.');
        });
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            const mockResponse = 'User created successfully';
            setupFetchMock(mockResponse);

            const userData = { username: 'newuser', password: 'password', name: 'New User', email: 'new@example.com', role: 'OPERATOR' as any };
            const result = await adminService.createUser(userData);

            expect(result).toBe(mockResponse);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/auth/register'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(userData)
                })
            );
        });

        it('should throw error on create failure', async () => {
            setupFetchMock(null, false);
            await expect(adminService.createUser({} as any)).rejects.toThrow('Error al crear el usuario.');
        });
    });

    describe('updateUser', () => {
        it('should update user correctly', async () => {
            const mockData = { name: 'Updated name' };
            const mockResponse = { id: 1, ...mockData };
            setupFetchMock(mockResponse);

            const result = await adminService.updateUser(1, mockData as any);
            expect(result).toEqual(mockResponse);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/admin/users/1'),
                expect.objectContaining({ method: 'PUT', body: JSON.stringify(mockData) })
            );
        });

        it('should throw error on update failure', async () => {
            setupFetchMock(null, false);
            await expect(adminService.updateUser(1, {} as any)).rejects.toThrow('Error al actualizar el usuario.');
        });
    });

    describe('updateUserStatus', () => {
        it('should update user status correctly', async () => {
            const mockData = { active: false };
            const mockResponse = { id: 1, active: false };
            setupFetchMock(mockResponse);

            const result = await adminService.updateUserStatus(1, mockData);
            expect(result).toEqual(mockResponse);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/admin/users/1/status'),
                expect.objectContaining({ method: 'PUT', body: JSON.stringify(mockData) })
            );
        });

        it('should throw error on update status failure', async () => {
            setupFetchMock(null, false);
            await expect(adminService.updateUserStatus(1, { active: true })).rejects.toThrow('Error al actualizar el estado del usuario.');
        });
    });

    describe('changeUserPassword', () => {
        it('should change user password correctly', async () => {
            setupFetchMock('Password updated');

            const result = await adminService.changeUserPassword(1, { newPassword: 'newpass' });
            expect(result).toBe('Password updated');
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/admin/users/1/password'),
                expect.objectContaining({ method: 'PUT', body: JSON.stringify({ newPassword: 'newpass' }) })
            );
        });

        it('should throw error on change password failure', async () => {
            setupFetchMock(null, false);
            await expect(adminService.changeUserPassword(1, { newPassword: '123' })).rejects.toThrow('Error al cambiar la contraseña.');
        });
    });

    describe('deleteUser', () => {
        it('should delete user gracefully', async () => {
            setupFetchMock(null, true);
            await adminService.deleteUser(1);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/admin/users/1'),
                expect.objectContaining({ method: 'DELETE' })
            );
        });

        it('should throw error when deletion fails', async () => {
            setupFetchMock(null, false);
            await expect(adminService.deleteUser(1)).rejects.toThrow('Error al eliminar el usuario.');
        });
    });
});
