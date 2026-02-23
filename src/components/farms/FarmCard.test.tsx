import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FarmCard from './FarmCard';
import { MemoryRouter } from 'react-router-dom';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('FarmCard', () => {
    const mockFarm = {
        id: 1,
        name: 'Finca Los Olivos',
        location: 'Mendoza, Argentina',
        farmSize: 50,
        reservoirCapacity: 10000,
        ownerId: 1,
        createdAt: '',
        updatedAt: '',
    };

    const mockActions = [
        { label: 'Editar', action: vi.fn(), className: 'edit' },
        { label: 'Eliminar', action: vi.fn(), className: 'delete' },
    ];

    it('renders farm details correctly', () => {
        render(
            <MemoryRouter>
                <FarmCard farm={mockFarm} actions={mockActions} />
            </MemoryRouter>
        );

        expect(screen.getByText('Finca Los Olivos')).toBeInTheDocument();
        expect(screen.getByText('Mendoza, Argentina')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('10.000')).toBeInTheDocument();
    });

    it('navigates to details when button is clicked', () => {
        render(
            <MemoryRouter>
                <FarmCard farm={mockFarm} actions={mockActions} />
            </MemoryRouter>
        );

        const detailBtn = screen.getByText('Ver Detalles');
        fireEvent.click(detailBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/farms/1');
    });

    it('renders actions menu', () => {
        render(
            <MemoryRouter>
                <FarmCard farm={mockFarm} actions={mockActions} />
            </MemoryRouter>
        );

        // ActionsMenu should be present
        expect(screen.getByRole('button', { name: /abrir menú de acciones/i })).toBeInTheDocument();
    });
});
