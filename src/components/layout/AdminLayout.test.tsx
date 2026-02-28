import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useAuthData } from '../../hooks/useAuthData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../hooks/useAuthData', () => ({
    useAuthData: vi.fn()
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

describe('AdminLayout Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAuthData as any).mockReturnValue({
            name: 'John Doe',
            role: 'ADMIN' // Maps to full nav setup
        });
    });

    it('should render basic layout structure', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminLayout />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.getByText('Hidra')).toBeInTheDocument();
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getByRole('main')).toBeInTheDocument();
        // Check standard Admin Nav Item exists
        expect(screen.getByText('Principal')).toBeInTheDocument();
    });

    it('should toggle sidebar visibility when mobile menu button clicked', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AdminLayout />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const layoutDiv = container.firstChild as HTMLElement;
        expect(layoutDiv).not.toHaveClass('sidebar-visible');

        const toggleBtn = container.querySelector('.mobile-menu-button');
        if (toggleBtn) {
            await user.click(toggleBtn);
            expect(layoutDiv).toHaveClass('sidebar-visible');

            const overlay = container.querySelector('.sidebar-overlay');
            if (overlay) {
                await user.click(overlay);
                expect(layoutDiv).not.toHaveClass('sidebar-visible');
            }
        }
    });
});
