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
    describe('createFarm', () => {
        it('should create farm', async () => {
            const mock = { id: 1 };
            (globalThis.fetch as any).mockResolvedValue({ ok: true, json: async () => mock });
            const result = await farmService.createFarm({ name: 'Finca' } as any);
            expect(result).toEqual(mock);
        });
        it('should throw error if failed', async () => {
            (globalThis.fetch as any).mockResolvedValue({ ok: false });
            await expect(farmService.createFarm({} as any)).rejects.toThrow('Error al crear la finca.');
        });
    });

    describe('updateFarm', () => {
        it('should update farm', async () => {
            const mock = { id: 1 };
            (globalThis.fetch as any).mockResolvedValue({ ok: true, json: async () => mock });
            const result = await farmService.updateFarm(1, { name: 'Finca' } as any);
            expect(result).toEqual(mock);
        });
        it('should throw error if failed', async () => {
            (globalThis.fetch as any).mockResolvedValue({ ok: false });
            await expect(farmService.updateFarm(1, {} as any)).rejects.toThrow('Error al actualizar la finca.');
        });
    });

    describe('deleteFarm', () => {
        it('should delete farm', async () => {
            (globalThis.fetch as any).mockResolvedValue({ ok: true });
            await farmService.deleteFarm(1);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/farms/1'), expect.objectContaining({ method: 'DELETE' }));
        });
        it('should throw error if failed', async () => {
            (globalThis.fetch as any).mockResolvedValue({ ok: false });
            await expect(farmService.deleteFarm(1)).rejects.toThrow('Error al eliminar la finca.');
        });
    });

    describe('assignUserToFarm & unassignUserFromFarm', () => {
        it('should assign and unassign user', async () => {
            (globalThis.fetch as any).mockResolvedValue({ ok: true });
            await farmService.assignUserToFarm(1, 2);
            await farmService.unassignUserFromFarm(1, 2);
            expect(fetch).toHaveBeenCalledTimes(2);
        });
        it('should throw error if assign fails', async () => {
            (globalThis.fetch as any).mockResolvedValue({ ok: false });
            await expect(farmService.assignUserToFarm(1, 2)).rejects.toThrow('Error al asignar el usuario a la finca.');
            await expect(farmService.unassignUserFromFarm(1, 2)).rejects.toThrow('Error al desasignar el usuario de la finca.');
        });
    });

    describe('getSectorsByFarm, createSector, updateSector, deleteSector', () => {
        it('should perform CRUD operations', async () => {
            const mock = { id: 1 };
            (globalThis.fetch as any).mockResolvedValue({ ok: true, json: async () => mock });
            await farmService.getSectorsByFarm(1);
            await farmService.createSector(1, {} as any);
            await farmService.updateSector(1, 2, {} as any);
            await farmService.deleteSector(1, 2);
            expect(fetch).toHaveBeenCalledTimes(4);
        });
        it('should throw errors if failed', async () => {
            (globalThis.fetch as any).mockResolvedValue({ ok: false });
            await expect(farmService.getSectorsByFarm(1)).rejects.toThrow('Error al obtener los sectores de la finca.');
            await expect(farmService.createSector(1, {} as any)).rejects.toThrow('Error al crear el sector.');
            await expect(farmService.updateSector(1, 2, {} as any)).rejects.toThrow('Error al actualizar el sector.');
            await expect(farmService.deleteSector(1, 2)).rejects.toThrow('Error al eliminar el sector.');
        });
    });

    describe('getEquipmentsByFarm, createEquipment, updateEquipment, deleteEquipment', () => {
        it('should perform CRUD operations', async () => {
            const mock = { id: 1 };
            (globalThis.fetch as any).mockResolvedValue({ ok: true, json: async () => mock });
            await farmService.getEquipmentsByFarm(1);
            await farmService.createEquipment(1, {} as any);
            await farmService.updateEquipment(1, 2, {} as any);
            await farmService.deleteEquipment(1, 2);
            expect(fetch).toHaveBeenCalledTimes(4);
        });
        it('should throw errors if failed', async () => {
            (globalThis.fetch as any).mockResolvedValue({ ok: false });
            await expect(farmService.getEquipmentsByFarm(1)).rejects.toThrow('Error al obtener los equipos de la finca.');
            await expect(farmService.createEquipment(1, {} as any)).rejects.toThrow('Error al crear el equipo.');
            await expect(farmService.updateEquipment(1, 2, {} as any)).rejects.toThrow('Error al actualizar el equipo.');
            await expect(farmService.deleteEquipment(1, 2)).rejects.toThrow('Error al eliminar el equipo.');
        });
    });

    describe('getWaterSourcesByFarm, createWaterSource, updateWaterSource, deleteWaterSource', () => {
        it('should perform CRUD operations', async () => {
            const mock = { id: 1 };
            (globalThis.fetch as any).mockResolvedValue({ ok: true, json: async () => mock });
            await farmService.getWaterSourcesByFarm(1);
            await farmService.createWaterSource(1, {} as any);
            await farmService.updateWaterSource(2, {} as any); // waterSourceId
            await farmService.deleteWaterSource(2);
            expect(fetch).toHaveBeenCalledTimes(4);
        });
        it('should throw errors if failed', async () => {
            (globalThis.fetch as any).mockResolvedValue({ ok: false });
            await expect(farmService.getWaterSourcesByFarm(1)).rejects.toThrow('Error al obtener las fuentes de agua.');
            await expect(farmService.createWaterSource(1, {} as any)).rejects.toThrow('Error al crear la fuente de agua.');
            await expect(farmService.updateWaterSource(2, {} as any)).rejects.toThrow('Error al actualizar la fuente de agua.');
            await expect(farmService.deleteWaterSource(2)).rejects.toThrow('Error al eliminar la fuente de agua.');
        });
    });

    describe('getAssignedUsers and getActiveSectors', () => {
        it('should fetch successful', async () => {
            const mock = { id: 1 };
            (globalThis.fetch as any).mockResolvedValue({ ok: true, json: async () => mock });
            await farmService.getAssignedUsers(1);
            await farmService.getActiveSectors();
            expect(fetch).toHaveBeenCalledTimes(2);
        });
        it('should throw errors if failed', async () => {
            (globalThis.fetch as any).mockResolvedValue({ ok: false, status: 500 });
            await expect(farmService.getAssignedUsers(1)).rejects.toThrow('Error al obtener los usuarios asignados.');
            await expect(farmService.getActiveSectors()).rejects.toThrow('Error al obtener los sectores activos.');
        });
        it('should throw forbidden for getAssignedUsers', async () => {
            (globalThis.fetch as any).mockResolvedValue({ ok: false, status: 403 });
            await expect(farmService.getAssignedUsers(1)).rejects.toThrow('No tienes permiso para ver los usuarios de esta finca.');
        });
    });
});
