import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import configService from './configService';
import authService from './authService';

vi.mock('./authService');

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('configService', () => {
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
            status: ok ? 200 : 400,
            text: async () => ok ? '' : 'Error text message'
        });
    };

    describe('Agronomic Config', () => {
        it('should fetch agronomic config', async () => {
            const mockData = { effectiveRainCoefficient: 0.8 };
            setupFetchMock(mockData);

            const result = await configService.getAgronomic();
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/admin/config/agronomic'),
                expect.objectContaining({ headers: expect.objectContaining({ 'Authorization': 'Bearer mock-token' }) })
            );
        });

        it('should update agronomic config', async () => {
            const mockData = { effectiveRainCoefficient: 0.8 };
            setupFetchMock(mockData);

            const result = await configService.updateAgronomic(mockData as any);
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/admin/config/agronomic'),
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(mockData),
                    headers: expect.objectContaining({ 'Authorization': 'Bearer mock-token' })
                })
            );
        });

        it('should throw error on update failure', async () => {
            setupFetchMock(null, false);
            await expect(configService.updateAgronomic({} as any)).rejects.toThrow('Error text message');
        });
    });

    describe('Organization Config', () => {
        it('should fetch organization config', async () => {
            const mockData = { organizationName: 'Test Org' };
            setupFetchMock(mockData);
            const result = await configService.getOrganization();
            expect(result).toEqual(mockData);
        });

        it('should update organization config', async () => {
            const mockData = { organizationName: 'Test Org' };
            setupFetchMock(mockData);
            const result = await configService.updateOrganization(mockData as any);
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/admin/config/organization'), expect.objectContaining({ method: 'PUT' }));
        });
    });

    describe('Security Config', () => {
        it('should fetch security config', async () => {
            const mockData = { sessionDurationHours: 10 };
            setupFetchMock(mockData);
            const result = await configService.getSecurity();
            expect(result).toEqual(mockData);
        });

        it('should update security config', async () => {
            const mockData = { sessionDurationHours: 10 };
            setupFetchMock(mockData);
            const result = await configService.updateSecurity(mockData as any);
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/admin/config/security'), expect.objectContaining({ method: 'PUT' }));
        });
    });

    describe('Notification Config', () => {
        it('should fetch notification config', async () => {
            const mockData = { globalNotificationsEnabled: true };
            setupFetchMock(mockData);
            const result = await configService.getNotifications();
            expect(result).toEqual(mockData);
        });

        it('should update notification config', async () => {
            const mockData = { globalNotificationsEnabled: true };
            setupFetchMock(mockData);
            const result = await configService.updateNotifications(mockData as any);
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/admin/config/notifications'), expect.objectContaining({ method: 'PUT' }));
        });
    });

    describe('Report Config', () => {
        it('should fetch report config', async () => {
            const mockData = { reportRetentionDays: 30 };
            setupFetchMock(mockData);
            const result = await configService.getReports();
            expect(result).toEqual(mockData);
        });

        it('should update report config', async () => {
            const mockData = { reportRetentionDays: 30 };
            setupFetchMock(mockData);
            const result = await configService.updateReports(mockData as any);
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/admin/config/reports'), expect.objectContaining({ method: 'PUT' }));
        });
    });

    describe('Weather Config', () => {
        it('should fetch weather config', async () => {
            const mockData = { weatherServiceEnabled: true };
            setupFetchMock(mockData);
            const result = await configService.getWeather();
            expect(result).toEqual(mockData);
        });

        it('should update weather config', async () => {
            const mockData = { weatherServiceEnabled: true };
            setupFetchMock(mockData);
            const result = await configService.updateWeather(mockData as any);
            expect(result).toEqual(mockData);
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/admin/config/weather'), expect.objectContaining({ method: 'PUT' }));
        });
    });
});
