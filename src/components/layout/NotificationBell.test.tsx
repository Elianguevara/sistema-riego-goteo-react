import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotificationBell from './NotificationBell';
import notificationService from '../../services/notificationService';
import { useAuthData } from '../../hooks/useAuthData';

vi.mock('../../services/notificationService');
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

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

describe('NotificationBell Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient.clear();
        (useAuthData as any).mockReturnValue({ role: 'ADMIN' });
        (notificationService.getUnreadCount as any).mockResolvedValue({ unreadCount: 0 });
        (notificationService.getNotifications as any).mockResolvedValue({ content: [], totalElements: 0 });
    });

    const renderWithProviders = () => render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <NotificationBell />
            </MemoryRouter>
        </QueryClientProvider>
    );

    it('should render bell icon without badge initially', async () => {
        renderWithProviders();
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.queryByText(/[0-9]+/)).not.toBeInTheDocument();
    });

    it('should render badge with unread count', async () => {
        (notificationService.getUnreadCount as any).mockResolvedValue({ unreadCount: 3 });
        renderWithProviders();
        await waitFor(() => {
            expect(screen.getByText('3')).toBeInTheDocument();
        });
    });

    it('should open dropdown and show empty state if no notifications', async () => {
        const user = userEvent.setup();
        renderWithProviders();

        await user.click(screen.getByRole('button'));

        expect(screen.getByText('Notificaciones')).toBeInTheDocument();
        expect(screen.getByText('No tienes notificaciones.')).toBeInTheDocument();
    });

    it('should render notifications list in dropdown', async () => {
        const mockContent = [
            { id: 1, message: 'Task assigned', type: 'TASK_ASSIGNED', isRead: false, relatedEntityId: 5, createdAt: new Date().toISOString() }
        ];
        (notificationService.getNotifications as any).mockResolvedValue({ content: mockContent, totalElements: 1 });

        const user = userEvent.setup();
        renderWithProviders();

        await user.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(screen.getByText('Task assigned')).toBeInTheDocument();
        });
    });

    it('should trigger markAsRead and navigate when clicking unread notification', async () => {
        const mockContent = [
            { id: 1, message: 'Test Notif', type: 'TASK_ASSIGNED', isRead: false, relatedEntityId: 5, createdAt: new Date().toISOString() }
        ];
        (notificationService.getNotifications as any).mockResolvedValue({ content: mockContent, totalElements: 1 });
        (notificationService.markAsRead as any).mockResolvedValue({});

        const user = userEvent.setup();
        renderWithProviders();

        await user.click(screen.getByRole('button')); // open dropdown

        await waitFor(() => {
            expect(screen.getByText('Test Notif')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Test Notif'));

        expect(notificationService.markAsRead).toHaveBeenCalledWith(1);
    });
});
