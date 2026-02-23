import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DailyIrrigationView from './DailyIrrigationView';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencias que no queremos probar aquí
vi.mock('./IrrigationForm', () => ({
    default: () => <div data-testid="irrigation-form">Mock Irrigation Form</div>
}));

vi.mock('../precipitation/PrecipitationForm', () => ({
    default: () => <div data-testid="precipitation-form">Mock Precipitation Form</div>
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <MemoryRouter>
            {children}
        </MemoryRouter>
    </QueryClientProvider>
);

describe('DailyIrrigationView', () => {
    const mockSectors = [
        { id: 1, name: 'Sector Norte', farmId: 1, farmName: 'Finca Test' },
    ] as any;

    const mockMonthlyData = [
        {
            sectorId: 1,
            sectorName: 'Sector Norte',
            dailyIrrigations: {
                '1': [{ waterAmount: 1, irrigationHours: 2 }]
            },
            dailyPrecipitations: {
                '1': 15.5
            }
        }
    ];

    const defaultProps = {
        farmId: 1,
        sectors: mockSectors,
        monthlyData: mockMonthlyData as any,
        year: 2023,
        month: 10,
        weatherData: undefined,
        isLoadingWeather: false,
        weatherError: null,
    };

    it('renders days and precipitation correctly', () => {
        render(<DailyIrrigationView {...defaultProps} />, { wrapper });

        // El día 1 debería tener 15.5 mm de lluvia
        expect(screen.getByText('15.5 mm')).toBeInTheDocument();
    });

    it('renders irrigation data correctly in hL', () => {
        render(<DailyIrrigationView {...defaultProps} />, { wrapper });

        // 1 m3 * 10 = 10.0 hL
        expect(screen.getByText('10.0 hL')).toBeInTheDocument();
        expect(screen.getByText('(2.0 hs)')).toBeInTheDocument();
    });

    it('shows add irrigation button when no data exists for a sector/day', () => {
        const propsNoData = { ...defaultProps, monthlyData: [] };
        render(<DailyIrrigationView {...propsNoData} />, { wrapper });

        expect(screen.getAllByText('Añadir Riego')[0]).toBeInTheDocument();
    });

    it('opens irrigation modal when clicking Ver/Editar', () => {
        render(<DailyIrrigationView {...defaultProps} />, { wrapper });

        const viewBtn = screen.getByText('Ver/Editar');
        fireEvent.click(viewBtn);

        expect(screen.getByTestId('irrigation-form')).toBeInTheDocument();
    });

    it('opens precipitation modal when clicking add precipitation button', () => {
        render(<DailyIrrigationView {...defaultProps} />, { wrapper });

        const addBtn = screen.getAllByTitle('Añadir lluvia')[0];
        fireEvent.click(addBtn);

        expect(screen.getByTestId('precipitation-form')).toBeInTheDocument();
    });
});
