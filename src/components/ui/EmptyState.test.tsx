import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState Component', () => {
    it('should render title correctly', () => {
        render(<EmptyState title="No content" />);
        expect(screen.getByText('No content')).toBeInTheDocument();
    });

    it('should render subtitle if provided', () => {
        render(<EmptyState title="No content" subtitle="Try another search" />);
        expect(screen.getByText('Try another search')).toBeInTheDocument();
    });

    it('should render icon if provided', () => {
        const { getByTestId } = render(<EmptyState title="test" icon={<span data-testid="mock-icon" />} />);
        expect(getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('should render action if provided', () => {
        const { getByRole } = render(
            <EmptyState title="test" action={<button>Action Button</button>} />
        );
        expect(getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });

    it('should append custom className', () => {
        const { container } = render(<EmptyState title="test" className="custom-empty" />);
        expect(container.firstChild).toHaveClass('custom-empty');
    });
});
