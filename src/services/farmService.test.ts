import { describe, it, expect, vi, beforeEach } from 'vitest';

// Preparar el entorno antes de importar el servicio
vi.stubEnv('VITE_API_BASE_URL', 'http://api.test.com');
vi.stubGlobal('fetch', vi.fn());

// Ahora importamos el servicio para que tome el env mockeado si es posible
import farmService from './farmService';

// Mock authService
vi.mock('./authService', () => ({
    default: {
        getToken: vi.fn(() => 'mock-token'),
    },
}));

describe('farmService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getFarms', () => {
        it('should fetch and return farms when response is ok', async () => {
            const mockFarms = [{ id: 1, name: 'Finca Test' }];
            (globalThis.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockFarms,
            });

            const result = await farmService.getFarms();

            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/farms'), expect.objectContaining({
                method: 'GET',
            }));
            expect(result).toEqual(mockFarms);
        });

        it('should throw an error when response is not ok', async () => {
            (globalThis.fetch as any).mockResolvedValue({
                ok: false,
            });

            await expect(farmService.getFarms()).rejects.toThrow('Error al obtener la lista de fincas.');
        });
    });

    describe('getFarmById', () => {
        it('should fetch and return a single farm when response is ok', async () => {
            const mockFarm = { id: 1, name: 'Finca Test' };
            (globalThis.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockFarm,
            });

            const result = await farmService.getFarmById(1);

            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/farms/1'), expect.objectContaining({
                method: 'GET',
            }));
            expect(result).toEqual(mockFarm);
        });

        it('should throw an error when response is not ok', async () => {
            (globalThis.fetch as any).mockResolvedValue({
                ok: false,
            });

            await expect(farmService.getFarmById(1)).rejects.toThrow('Error al obtener los detalles de la finca.');
        });
    });
});
