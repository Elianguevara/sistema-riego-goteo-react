import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './Dashboard';
import dashboardService from '../services/dashboardService';
import adminService from '../services/adminService';
import farmService from '../services/farmService';

vi.mock('../services/dashboardService');
vi.mock('../services/adminService');
vi.mock('../services/farmService');

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: Infinity
        }
    },
});

describe('Dashboard Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (dashboardService.getKpis as any).mockResolvedValue({ totalUsers: 10, totalFarms: 5, activeSectors: 3 });
        (adminService.getUsers as any).mockResolvedValue({ content: [{ id: 1, name: 'Test User', username: 'testuser', email: 'a@a.com', roleName: 'ADMIN', active: true }], totalElements: 1 });
        (farmService.getFarms as any).mockResolvedValue([{ id: 1, name: 'Test Farm', location: 'Location', farmSize: 10 }]);
        (farmService.getActiveSectors as any).mockResolvedValue([{ id: 1, name: 'Sector A', farmName: 'Test Farm', farmId: 1, equipmentName: 'Eq 1' }]);
        (dashboardService.getUserStats as any).mockResolvedValue({ totalUsers: 10, activeUsers: 8, inactiveUsers: 2, usersByRole: { ADMIN: 2, USER: 8 } });
    });

    const renderWithProviders = () => {
        const testClient = createTestQueryClient();
        return render(
            <QueryClientProvider client={testClient}>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </QueryClientProvider>
        );
    };

    it('should render generic KPIs and Users table by default', async () => {
        renderWithProviders();

        // Wait for KPIs
        await waitFor(() => {
            expect(screen.getByText('10')).toBeInTheDocument(); // totalUsers KPI
        });

        // Wait for Users Table
        expect(screen.getByText('Usuarios Recientes')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('testuser')).toBeInTheDocument();
        });
    });

    it('should show Farms table when clicking Fincas KPI', async () => {
        const user = userEvent.setup();
        renderWithProviders();

        await waitFor(() => expect(screen.getByText('Usuarios Recientes')).toBeInTheDocument());

        const farmsKpi = screen.queryAllByText('Fincas')[0].closest('.ui-stat-card');
        await user.click(farmsKpi!);

        const farmText = await screen.findByText('Test Farm', undefined, { timeout: 2000 });
        expect(farmText).toBeInTheDocument();
    });

    it('should show Sectors table when clicking Sectors KPI', async () => {
        const user = userEvent.setup();
        renderWithProviders();

        await waitFor(() => expect(screen.getByText('Usuarios Recientes')).toBeInTheDocument());

        const sectorsKpi = screen.getByText('Sectores').closest('.ui-stat-card');
        await user.click(sectorsKpi!);

        expect(screen.getByText('Sectores Activos')).toBeInTheDocument(); // Table header

        await waitFor(() => {
            expect(screen.getByText('Sector A')).toBeInTheDocument();
        });
    });

    it('should show User Stats when clicking Analíticas KPI', async () => {
        const user = userEvent.setup();
        renderWithProviders();

        await waitFor(() => expect(screen.getByText('Usuarios Recientes')).toBeInTheDocument());

        const statsKpi = screen.getByText('Analíticas').closest('.ui-stat-card');
        await user.click(statsKpi!);

        expect(screen.getByText('Estadísticas de Usuarios')).toBeInTheDocument(); // Table header
        await waitFor(() => {
            expect(screen.getByText('Usuarios Totales')).toBeInTheDocument();
        });
    });
});
