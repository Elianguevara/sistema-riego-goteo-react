import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import weatherService from './weatherService';
import authService from './authService';

vi.mock('./authService');

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('weatherService', () => {
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

    describe('getCurrentWeather', () => {
        it('should fetch current weather for a farm correctly', async () => {
            const mockData = { temperature: 25, condition: 'Sunny' };
            setupFetchMock(mockData);

            const result = await weatherService.getCurrentWeather(1);
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/farms/1/weather/current'),
                expect.objectContaining({ headers: expect.objectContaining({ 'Authorization': 'Bearer mock-token' }) })
            );
        });

        it('should throw coordinate error on 409 conflict', async () => {
            setupFetchMock({ message: 'No coordinates' }, false, 409);
            await expect(weatherService.getCurrentWeather(1)).rejects.toThrow('No coordinates');
        });

        it('should throw generic coordinate error on 409 conflict if no message provided', async () => {
            setupFetchMock({}, false, 409);
            await expect(weatherService.getCurrentWeather(1)).rejects.toThrow('La finca no tiene coordenadas para consultar el clima.');
        });

        it('should throw generic error on other failures', async () => {
            setupFetchMock(null, false, 500);
            await expect(weatherService.getCurrentWeather(1)).rejects.toThrow('Error al obtener los datos del clima.');
        });
    });
});
