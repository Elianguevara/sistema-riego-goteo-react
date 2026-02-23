import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PrecipitationList from './PrecipitationList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import precipitationService from '../../services/precipitationService';
import { toast } from 'sonner';

// Mock precipitationService
vi.mock('../../services/precipitationService', () => ({
    default: {
        getPrecipitationsByFarm: vi.fn(),
        deletePrecipitation: vi.fn(),
    },
}));

// Mock sonner
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
            {children}
        </MemoryRouter>
    </QueryClientProvider>
);

describe('PrecipitationList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Definir window.confirm directamente
        window.confirm = vi.fn().mockReturnValue(true);
    });

    it('renders loading state initially', () => {
        (precipitationService.getPrecipitationsByFarm as any).mockReturnValue(new Promise(() => { }));

        const { container } = render(<PrecipitationList farmId={1} />, { wrapper });

        // Buscar la clase animate-spin en el contenedor
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders error state when fetch fails', async () => {
        (precipitationService.getPrecipitationsByFarm as any).mockRejectedValue(new Error('Fetch failed'));

        render(<PrecipitationList farmId={1} />, { wrapper });

        expect(await screen.findByText(/No se pudo cargar el historial/i)).toBeInTheDocument();
    });

    it('renders empty state when no data', async () => {
        (precipitationService.getPrecipitationsByFarm as any).mockResolvedValue([]);

        render(<PrecipitationList farmId={1} />, { wrapper });

        expect(await screen.findByText(/No hay registros para esta finca/i)).toBeInTheDocument();
    });

    it('renders list of precipitations when data is available', async () => {
        const mockData = [
            { id: 1, farmId: 1, mmRain: 10.5, precipitationDate: '2023-10-01' },
            { id: 2, farmId: 1, mmRain: 5.0, precipitationDate: '2023-10-02' },
        ];
        (precipitationService.getPrecipitationsByFarm as any).mockResolvedValue(mockData);

        render(<PrecipitationList farmId={1} />, { wrapper });

        expect(await screen.findByText('10.5 mm')).toBeInTheDocument();
        expect(screen.getByText('5.0 mm')).toBeInTheDocument();
    });

    it('handles delete action correctly', async () => {
        const mockData = [{ id: 1, farmId: 1, mmRain: 10.5, precipitationDate: '2023-10-01' }];
        (precipitationService.getPrecipitationsByFarm as any).mockResolvedValue(mockData);
        (precipitationService.deletePrecipitation as any).mockResolvedValue({});

        render(<PrecipitationList farmId={1} />, { wrapper });

        const deleteBtn = await screen.findByTitle('Eliminar registro');
        fireEvent.click(deleteBtn);

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(precipitationService.deletePrecipitation).toHaveBeenCalledWith(1);
        });

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Registro eliminado correctamente.');
        });
    });
});
