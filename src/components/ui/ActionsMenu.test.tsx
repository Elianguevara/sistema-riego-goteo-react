import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ActionsMenu from './ActionsMenu';

describe('ActionsMenu Component', () => {
    const mockItems = [
        { label: 'Edit', action: vi.fn(), className: 'edit-class' },
        { label: 'Delete', action: vi.fn(), className: 'delete-class' },
    ];

    it('should not render items initially', () => {
        render(<ActionsMenu items={mockItems} />);
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should render items when button is clicked', async () => {
        const user = userEvent.setup();
        render(<ActionsMenu items={mockItems} />);

        const toggleButton = screen.getByRole('button', { name: 'Abrir menú de acciones' });
        await user.click(toggleButton);

        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toHaveClass('delete-class');
    });

    it('should invoke action and close menu when item is clicked', async () => {
        const user = userEvent.setup();
        render(<ActionsMenu items={mockItems} />);

        // Open
        await user.click(screen.getByRole('button', { name: 'Abrir menú de acciones' }));

        // Click item
        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        expect(mockItems[0].action).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Edit')).not.toBeInTheDocument(); // Verifies it closed
    });

    it('should close menu when clicking outside', async () => {
        const user = userEvent.setup();
        render(
            <div>
                <div data-testid="outside">Outside</div>
                <ActionsMenu items={mockItems} />
            </div>
        );

        // Open menu
        await user.click(screen.getByRole('button', { name: 'Abrir menú de acciones' }));
        expect(screen.getByText('Edit')).toBeInTheDocument();

        // Click outside
        await user.click(screen.getByTestId('outside'));

        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
});
