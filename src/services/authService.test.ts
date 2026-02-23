import { describe, it, expect, vi, beforeEach } from 'vitest';

// Preparar el entorno antes de importar el servicio
vi.stubEnv('VITE_API_BASE_URL', 'http://api.test.com');
vi.stubGlobal('fetch', vi.fn());

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
})();
vi.stubGlobal('localStorage', localStorageMock);

import authService from './authService';

describe('authService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('login', () => {
        it('should store token and return data on successful login', async () => {
            const mockResponse = { token: 'fake-token', user: { id: 1, username: 'test' } };
            (globalThis.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await authService.login('user', 'pass');

            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/auth/login'), expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ username: 'user', password: 'pass' }),
            }));
            expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'fake-token');
            expect(result).toEqual(mockResponse);
        });

        it('should throw USER_DISABLED error when backend returns user is disabled', async () => {
            (globalThis.fetch as any).mockResolvedValue({
                ok: false,
                status: 403,
                text: async () => 'User is disabled',
            });

            await expect(authService.login('user', 'pass')).rejects.toThrow('USER_DISABLED');
        });

        it('should throw generic HTTP error when response is not ok', async () => {
            (globalThis.fetch as any).mockResolvedValue({
                ok: false,
                status: 500,
                text: async () => 'Internal Server Error',
            });

            await expect(authService.login('user', 'pass')).rejects.toThrow('Error HTTP: 500');
        });
    });

    describe('logout', () => {
        it('should remove token from localStorage', () => {
            authService.logout();
            expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
        });
    });

    describe('getToken', () => {
        it('should return token from localStorage', () => {
            (localStorage.getItem as any).mockReturnValue('stored-token');
            const token = authService.getToken();
            expect(token).toBe('stored-token');
            expect(localStorage.getItem).toHaveBeenCalledWith('authToken');
        });
    });
});
