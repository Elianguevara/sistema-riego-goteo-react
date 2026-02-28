import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ErrorState from './ErrorState';

describe('ErrorState Component', () => {
    it('should render message and default title', () => {
        render(<ErrorState message="Something went wrong" />);
        expect(screen.getByText('Ocurrió un error')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render custom title', () => {
        render(<ErrorState title="Fatal Error" message="Details" />);
        expect(screen.getByText('Fatal Error')).toBeInTheDocument();
    });

    it('should not render retry button if onRetry is missing', () => {
        render(<ErrorState message="Error" />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render and invoke retry button', async () => {
        const onRetryMock = vi.fn();
        const user = userEvent.setup();

        render(<ErrorState message="Error" onRetry={onRetryMock} retryLabel="Try Again" />);

        const button = screen.getByRole('button', { name: 'Try Again' });
        expect(button).toBeInTheDocument();

        await user.click(button);
        expect(onRetryMock).toHaveBeenCalledTimes(1);
    });

    it('should append custom className', () => {
        render(<ErrorState message="msg" className="my-error" />);
        expect(screen.getByRole('alert')).toHaveClass('my-error');
    });
});
