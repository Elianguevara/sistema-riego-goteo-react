import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ConfirmationModal from './ConfirmationModal';

describe('ConfirmationModal Component', () => {
    it('should render correct text and defaults', () => {
        render(
            <ConfirmationModal
                message="Are you sure?"
                onConfirm={() => { }}
                onCancel={() => { }}
                isLoading={false}
            />
        );
        expect(screen.getByText('Confirmación Requerida')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });

    it('should render custom titles and labels', () => {
        render(
            <ConfirmationModal
                message="Delete item?"
                onConfirm={() => { }}
                onCancel={() => { }}
                isLoading={false}
                title="Warning"
                confirmText="Yes, delete"
                cancelText="No, keep"
            />
        );
        expect(screen.getByText('Warning')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'No, keep' })).toBeInTheDocument();
    });

    it('should call onConfirm when confirm clicked', async () => {
        const onConfirmMock = vi.fn();
        const user = userEvent.setup();
        render(
            <ConfirmationModal
                message="Confirm"
                onConfirm={onConfirmMock}
                onCancel={() => { }}
                isLoading={false}
            />
        );
        await user.click(screen.getByRole('button', { name: 'Confirmar' }));
        expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });

    it('should disable buttons and show loading text when isLoading is true', () => {
        render(
            <ConfirmationModal
                message="Confirm"
                onConfirm={() => { }}
                onCancel={() => { }}
                isLoading={true}
            />
        );

        const btnCancel = screen.getByRole('button', { name: 'Cancelar' });
        const btnConfirm = screen.getByRole('button', { name: 'Procesando...' });

        expect(btnCancel).toBeDisabled();
        expect(btnConfirm).toBeDisabled();
    });
});
