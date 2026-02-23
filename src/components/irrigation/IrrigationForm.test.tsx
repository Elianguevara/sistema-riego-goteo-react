import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IrrigationForm from './IrrigationForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import irrigationService from '../../services/irrigationService';
import farmService from '../../services/farmService';
import { toast } from 'sonner';

// Mock services
vi.mock('../../services/irrigationService', () => ({
    default: {
        createIrrigation: vi.fn(),
    },
}));

vi.mock('../../services/farmService', () => ({
    default: {
        getEquipmentsByFarm: vi.fn(),
    },
}));

// Mock sonner
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <MemoryRouter>
            {children}
        </MemoryRouter>
    </QueryClientProvider>
);

describe('IrrigationForm', () => {
    const defaultProps = {
        farmId: 1,
        sector: { id: 1, name: 'Sector Norte', farmId: 1, farmName: 'Finca Test', equipmentId: 10, equipmentName: 'Bomba 1' },
        date: '2023-10-01',
        onClose: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (farmService.getEquipmentsByFarm as any).mockResolvedValue([]);
        (irrigationService.createIrrigation as any).mockResolvedValue({});
    });

    it('renders correctly with sector equipment', () => {
        render(<IrrigationForm {...defaultProps} />, { wrapper });

        expect(screen.getByText(/Registrar Riego para Sector Norte/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('Bomba 1')).toBeDisabled();
        expect(screen.getByLabelText(/Hora Inicio/i)).toHaveValue('08:00');
    });

    it('calculates end time correctly when hours change', async () => {
        render(<IrrigationForm {...defaultProps} />, { wrapper });

        const hoursInput = screen.getByLabelText(/Horas de Riego/i);
        fireEvent.change(hoursInput, { target: { name: 'irrigationHours', value: '2' } });

        // 08:00 + 2h = 10:00
        expect(screen.getByDisplayValue(/10:00:00/i)).toBeInTheDocument();
    });

    it('handles field validation and shows error if endDateTime is missing', async () => {
        const propsWithoutStart = { ...defaultProps, date: '' };
        render(<IrrigationForm {...propsWithoutStart} />, { wrapper });

        const saveBtn = screen.getByText('Guardar Riego');
        fireEvent.click(saveBtn);

        // El botón debería estar deshabilitado si no hay endDateTime
        expect(saveBtn).toBeDisabled();
    });

    it('submits form successfully', async () => {
        (irrigationService.createIrrigation as any).mockResolvedValue({ id: 99 });

        render(<IrrigationForm {...defaultProps} />, { wrapper });

        fireEvent.click(screen.getByText('Guardar Riego'));

        await waitFor(() => {
            expect(irrigationService.createIrrigation).toHaveBeenCalledWith(expect.objectContaining({
                sectorId: 1,
                waterAmount: 1,
                equipmentId: 10
            }));
            expect(toast.success).toHaveBeenCalledWith('Riego registrado correctamente.');
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it('handles submission error', async () => {
        (irrigationService.createIrrigation as any).mockRejectedValue(new Error('Server error'));

        render(<IrrigationForm {...defaultProps} />, { wrapper });

        fireEvent.click(screen.getByText('Guardar Riego'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Server error');
        });
    });

    it('shows equipment select if sector has no equipment', async () => {
        const propsNoEq = { ...defaultProps, sector: { ...defaultProps.sector, equipmentId: undefined, equipmentName: undefined } };
        (farmService.getEquipmentsByFarm as any).mockResolvedValue([
            { id: 20, name: 'Bomba 2' }
        ]);

        render(<IrrigationForm {...propsNoEq} />, { wrapper });

        expect(await screen.findByText('Bomba 2')).toBeInTheDocument();

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '20' } });
        expect(screen.getByRole('combobox')).toHaveValue('20');
    });
});
