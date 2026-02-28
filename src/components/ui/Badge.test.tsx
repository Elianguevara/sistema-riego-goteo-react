import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from './Badge';

describe('Badge Component', () => {
    it('should render children correctly', () => {
        render(<Badge>Test Badge</Badge>);
        expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('should apply neutral and sm classes by default', () => {
        render(<Badge>Default</Badge>);
        const badge = screen.getByText('Default');
        expect(badge).toHaveClass('ui-badge', 'ui-badge--neutral');
        expect(badge).not.toHaveClass('ui-badge--md');
    });

    it('should apply specified variant class', () => {
        render(<Badge variant="success">Success</Badge>);
        expect(screen.getByText('Success')).toHaveClass('ui-badge--success');
    });

    it('should apply md size class when size is md', () => {
        render(<Badge size="md">Big Badge</Badge>);
        const badge = screen.getByText('Big Badge');
        expect(badge).toHaveClass('ui-badge--md');
    });

    it('should append custom className', () => {
        render(<Badge className="custom-class">Custom</Badge>);
        expect(screen.getByText('Custom')).toHaveClass('custom-class', 'ui-badge');
    });
});
