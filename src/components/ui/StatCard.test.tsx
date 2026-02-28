import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import StatCard from './StatCard';

describe('StatCard Component', () => {
    const mockIcon = <svg data-testid="mock-icon" />;

    it('should render basic fields correctly', () => {
        render(<StatCard label="Total Farms" value="42" icon={mockIcon} />);
        expect(screen.getByText('Total Farms')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('should render subtitle if provided', () => {
        render(<StatCard label="Total" value="10" icon={mockIcon} subtitle="+2 this week" />);
        expect(screen.getByText('+2 this week')).toBeInTheDocument();
    });

    it('should apply variant and position classes', () => {
        render(
            <StatCard
                label="Alerts"
                value="5"
                icon={mockIcon}
                variant="danger"
                iconPosition="left"
                iconStyle="light"
            />
        );
        const card = screen.getByText('Alerts').closest('.ui-stat-card');
        expect(card).toHaveClass('ui-stat-card--icon-left');

        const iconContainer = screen.getByTestId('mock-icon').parentElement;
        expect(iconContainer).toHaveClass('ui-stat-card__icon--danger', 'ui-stat-card__icon--light');
    });

    it('should handle interaction when onClick is provided', async () => {
        const onClickMock = vi.fn();
        const user = userEvent.setup();

        render(<StatCard label="Clickable" value="1" icon={mockIcon} onClick={onClickMock} />);

        const card = screen.getByRole('button');
        expect(card).toHaveClass('ui-stat-card--interactive');

        await user.click(card);
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('should handle Enter key for onClick', async () => {
        const onClickMock = vi.fn();
        render(<StatCard label="Clickable" value="1" icon={mockIcon} onClick={onClickMock} />);

        const card = screen.getByRole('button');
        card.focus();

        const user = userEvent.setup();
        await user.keyboard('{Enter}');
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('should show active state if isActive is true', () => {
        render(<StatCard label="Active" value="1" icon={mockIcon} isActive={true} onClick={() => { }} />);
        const card = screen.getByRole('button');
        expect(card).toHaveClass('ui-stat-card--active');
        expect(card).toHaveAttribute('aria-pressed', 'true');
    });
});
