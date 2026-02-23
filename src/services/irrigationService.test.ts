import { describe, it, expect, vi, beforeEach } from 'vitest';

// Preparar el entorno antes de importar el servicio
vi.stubEnv('VITE_API_BASE_URL', 'http://api.test.com');
vi.stubGlobal('fetch', vi.fn());

import irrigationService from './irrigationService';

// Mock authService
vi.mock('./authService', () => ({
    default: {
        getToken: vi.fn(() => 'mock-token'),
    },
}));

describe('irrigationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getMonthlyIrrigationView', () => {
        it('should fetch and return monthly view data when response is ok', async () => {
            const mockData = [{ sectorId: 1, sectorName: 'Sector A', dailyIrrigations: {} }];
            (globalThis.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockData,
            });

            const result = await irrigationService.getMonthlyIrrigationView(1, 2023, 10);

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/farms/1/irrigations/monthly-view?year=2023&month=10'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer mock-token',
                    }),
                })
            );
            expect(result).toEqual(mockData);
        });

        it('should throw an error when response is not ok', async () => {
            (globalThis.fetch as any).mockResolvedValue({
                ok: false,
            });

            await expect(irrigationService.getMonthlyIrrigationView(1, 2023, 10))
                .rejects.toThrow('Error al obtener la vista mensual de riegos.');
        });
    });

    describe('createIrrigation', () => {
        it('should call create endpoint and return record when response is ok', async () => {
            const mockRequest = {
                sectorId: 1,
                waterAmount: 10,
                startDateTime: '2023-10-01T08:00:00',
                endDateTime: '2023-10-01T10:00:00',
                equipmentId: 10,
                irrigationHours: 2
            };
            const mockResponse = { id: 1, ...mockRequest };
            (globalThis.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await irrigationService.createIrrigation(mockRequest);

            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/irrigation'), expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(mockRequest),
            }));
            expect(result).toEqual(mockResponse);
        });

        it('should throw error with message from balance if response is not ok', async () => {
            (globalThis.fetch as any).mockResolvedValue({
                ok: false,
                json: async () => ({ message: 'Insufficient water' }),
            });

            await expect(irrigationService.createIrrigation({} as any)).rejects.toThrow('Insufficient water');
        });
    });
});
