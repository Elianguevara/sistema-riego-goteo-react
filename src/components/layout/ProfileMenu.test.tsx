import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';
import authService from '../../services/authService';
import { useAuthData } from '../../hooks/useAuthData';

vi.mock('../../services/authService');
vi.mock('../../hooks/useAuthData', () => ({
    useAuthData: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('ProfileMenu Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAuthData as any).mockReturnValue({
            name: 'John Doe',
            role: 'Admin'
        });
    });

    it('should render initials and user info', () => {
        render(
            <MemoryRouter>
                <ProfileMenu />
            </MemoryRouter>
        );
        expect(screen.getByText('JD')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should render fallback text when authData is empty', () => {
        (useAuthData as any).mockReturnValue(null);
        render(
            <MemoryRouter>
                <ProfileMenu />
            </MemoryRouter>
        );
        expect(screen.getByText('?')).toBeInTheDocument();
        expect(screen.getByText('Usuario')).toBeInTheDocument();
        expect(screen.getByText('Invitado')).toBeInTheDocument();
    });

    it('should open dropdown when clicked', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <ProfileMenu />
            </MemoryRouter>
        );

        expect(screen.queryByText('Perfil de Usuario')).not.toBeInTheDocument();

        const trigger = screen.getByRole('button');
        await user.click(trigger);

        expect(screen.getByText('Perfil de Usuario')).toBeInTheDocument();
        expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
    });

    it('should handle logout', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <ProfileMenu />
            </MemoryRouter>
        );

        await user.click(screen.getByRole('button')); // open menu
        await user.click(screen.getByText('Cerrar Sesión')); // click logout

        expect(authService.logout).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});
