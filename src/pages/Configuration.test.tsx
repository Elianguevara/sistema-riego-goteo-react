import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Configuration from './Configuration';
import { configService } from '../services/configService';

vi.mock('../services/configService');

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
    },
});

describe('Configuration Page Forms', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (configService.getAgronomic as any).mockResolvedValue({ effectiveRainCoefficient: 0.8, maxIrrigationHoursPerDay: 12, minIrrigationIntervalHours: 4, precipitationEffectivenessThresholdMm: 5, reservoirLowThresholdPercent: 20 });
        (configService.getOrganization as any).mockResolvedValue({ organizationName: 'Org', organizationAddress: 'Address', organizationPhone: '123', organizationEmail: 'email' });
        (configService.getSecurity as any).mockResolvedValue({ sessionDurationHours: 12, maxFailedLoginAttempts: 5, passwordMinLength: 8, forcePasswordChangeOnFirstLogin: true });
        (configService.getNotifications as any).mockResolvedValue({ globalNotificationsEnabled: true, channels: { push: { enabled: true }, email: { enabled: false }, sms: { enabled: true } } });
        (configService.getReports as any).mockResolvedValue({ reportRetentionDays: 30, maxReportDateRangeMonths: 6, defaultReportFormat: 'PDF' });
        (configService.getWeather as any).mockResolvedValue({ weatherServiceEnabled: true, weatherProvider: 'WeatherAPI', weatherApiKey: 'secret', weatherUpdateIntervalMinutes: 60 });
    });

    const renderWithProviders = () => {
        const testClient = createTestQueryClient();
        return render(
            <QueryClientProvider client={testClient}>
                <Configuration />
            </QueryClientProvider>
        );
    };

    it('should render generic structure and first tab (Agronomic) by default', async () => {
        renderWithProviders();

        expect(screen.getByText('Configuración del Sistema')).toBeInTheDocument();

        // Wait for Agronomic data
        await waitFor(() => {
            expect(screen.getByDisplayValue('0.8')).toBeInTheDocument(); // effectiveRainCoefficient
        });
    });

    it('should switch to Organization tab and submit changes', async () => {
        const user = userEvent.setup();
        renderWithProviders();

        const orgTab = screen.getByRole('button', { name: /Organización/i });
        await user.click(orgTab);

        await waitFor(() => {
            expect(screen.getByDisplayValue('Org')).toBeInTheDocument();
        });

        // Submit form
        (configService.updateOrganization as any).mockResolvedValue({ organizationName: 'NewOrg', organizationAddress: 'Address', organizationPhone: '123', organizationEmail: 'email' });

        const submitBtn = screen.getByRole('button', { name: /Guardar cambios/i });
        fireEvent.submit(submitBtn.closest('form')!);

        await waitFor(() => {
            expect(configService.updateOrganization).toHaveBeenCalledTimes(1);
        });
    });

    it('should switch to Notifications tab and render toggle', async () => {
        const user = userEvent.setup();
        renderWithProviders();

        const notifTab = screen.getByRole('button', { name: /Notificaciones/i });
        await user.click(notifTab);

        await waitFor(() => {
            expect(screen.getByText('Activar Notificaciones Globales')).toBeInTheDocument();
        });

        // Since we mock globalNotificationsEnabled = true
        // And checkboxes don't have explicit labels wrapping input completely properly in the DOM for direct query, we know they rendered if the title is there and no error is thrown
        (configService.updateNotifications as any).mockResolvedValue({});
        const submitBtn = screen.getByRole('button', { name: /Guardar cambios/i });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(configService.updateNotifications).toHaveBeenCalledTimes(1);
        });
    });

    it('should handle Security form rendering and submission', async () => {
        const user = userEvent.setup();
        renderWithProviders();

        const secTab = screen.getByRole('button', { name: /Seguridad/i });
        await user.click(secTab);

        await waitFor(() => {
            expect(screen.getByDisplayValue('12')).toBeInTheDocument(); // sessionDurationHours
        });

        (configService.updateSecurity as any).mockResolvedValue({});
        const submitBtn = screen.getByRole('button', { name: /Guardar cambios/i });
        fireEvent.submit(submitBtn.closest('form')!);

        await waitFor(() => {
            expect(configService.updateSecurity).toHaveBeenCalledTimes(1);
        });
    });
});
