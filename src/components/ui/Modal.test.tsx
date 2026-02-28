import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Modal from './Modal';

describe('Modal Component', () => {
    it('should not render when isOpen is false', () => {
        render(<Modal isOpen={false}>Content</Modal>);
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should render content when isOpen is true', () => {
        render(<Modal isOpen={true}>Content</Modal>);
        expect(screen.getByText('Content')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should apply size class', () => {
        render(<Modal isOpen={true} size="lg">Content</Modal>);
        expect(screen.getByRole('dialog')).toHaveClass('ui-modal__container--lg');
    });

    it('should append custom className to container', () => {
        render(<Modal isOpen={true} className="my-modal">Content</Modal>);
        expect(screen.getByRole('dialog')).toHaveClass('my-modal');
    });

    it('should call onClose when clicking overlay', async () => {
        const onCloseMock = vi.fn();
        const user = userEvent.setup();
        render(<Modal isOpen={true} onClose={onCloseMock}>Content</Modal>);

        const overlay = screen.getByRole('presentation');
        await user.click(overlay);
        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when clicking inside dialog', async () => {
        const onCloseMock = vi.fn();
        const user = userEvent.setup();
        render(<Modal isOpen={true} onClose={onCloseMock}>Content</Modal>);

        const dialog = screen.getByRole('dialog');
        await user.click(dialog);
        expect(onCloseMock).not.toHaveBeenCalled();
    });

    it('should call onClose when Escape is pressed', () => {
        const onCloseMock = vi.fn();
        render(<Modal isOpen={true} onClose={onCloseMock}>Content</Modal>);

        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should lock body scroll when open', () => {
        render(<Modal isOpen={true}>Content</Modal>);
        expect(document.body.style.overflow).toBe('hidden');
    });
});
