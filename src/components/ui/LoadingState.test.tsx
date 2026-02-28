import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingState from './LoadingState';

describe('LoadingState Component', () => {
    it('should render with default message', () => {
        render(<LoadingState />);
        expect(screen.getByText('Cargando...')).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando...');
    });

    it('should render custom message', () => {
        render(<LoadingState message="Wait please" />);
        expect(screen.getByText('Wait please')).toBeInTheDocument();
    });

    it('should not render paragraph if message is empty', () => {
        const { container } = render(<LoadingState message="" />);
        expect(container.querySelector('p')).not.toBeInTheDocument();
    });

    it('should apply fullPage class when fullPage is true', () => {
        render(<LoadingState fullPage />);
        expect(screen.getByRole('status')).toHaveClass('loading-state--full-page');
    });

    it('should append custom className', () => {
        render(<LoadingState className="custom-loading" />);
        expect(screen.getByRole('status')).toHaveClass('custom-loading');
    });
});
