import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatusToggle from './StatusToggle';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

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

describe('StatusToggle', () => {
    it('renders correctly when active', () => {
        render(
            <StatusToggle isActive={true} isLoading={false} onChange={() => { }} />,
            { wrapper }
        );

        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
    });

    it('renders correctly when inactive', () => {
        render(
            <StatusToggle isActive={false} isLoading={false} onChange={() => { }} />,
            { wrapper }
        );

        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);
    });

    it('calls onChange when clicked and not loading', () => {
        const onChange = vi.fn();
        render(
            <StatusToggle isActive={false} isLoading={false} onChange={onChange} />,
            { wrapper }
        );

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('does not call onChange when clicked and loading', () => {
        const onChange = vi.fn();
        render(
            <StatusToggle isActive={false} isLoading={true} onChange={onChange} />,
            { wrapper }
        );

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(onChange).not.toHaveBeenCalled();
        expect(checkbox).toBeDisabled();
    });
});
