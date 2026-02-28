import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TableToolbar from './TableToolbar';

describe('TableToolbar Component', () => {
    it('should render search input with value and placeholder', () => {
        render(
            <TableToolbar
                searchValue="test search"
                onSearchChange={() => { }}
                searchPlaceholder="Search here..."
            />
        );
        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('test search');
        expect(input).toHaveAttribute('placeholder', 'Search here...');
    });

    it('should call onSearchChange when typing', async () => {
        const onSearchChangeMock = vi.fn();
        const user = userEvent.setup();

        render(
            <TableToolbar
                searchValue=""
                onSearchChange={onSearchChangeMock}
            />
        );

        const input = screen.getByRole('textbox');
        await user.type(input, 'a');

        expect(onSearchChangeMock).toHaveBeenCalledWith('a');
    });

    it('should render children controls if provided', () => {
        render(
            <TableToolbar searchValue="" onSearchChange={() => { }}>
                <button>Filter</button>
            </TableToolbar>
        );
        expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument();
    });

    it('should apply custom className', () => {
        const { container } = render(
            <TableToolbar searchValue="" onSearchChange={() => { }} className="custom-toolbar" />
        );
        expect(container.firstChild).toHaveClass('custom-toolbar');
    });
});
