import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PageHeader from './PageHeader';

describe('PageHeader Component', () => {
    it('should render title correctly', () => {
        render(<PageHeader title="Main Title" />);
        expect(screen.getByRole('heading', { level: 1, name: 'Main Title' })).toBeInTheDocument();
    });

    it('should render subtitle if provided', () => {
        render(<PageHeader title="Main Title" subtitle="This is a subtitle" />);
        expect(screen.getByText('This is a subtitle')).toBeInTheDocument();
    });

    it('should render action element if provided', () => {
        render(
            <PageHeader
                title="Main Title"
                action={<button>Add New</button>}
            />
        );
        expect(screen.getByRole('button', { name: 'Add New' })).toBeInTheDocument();
    });

    it('should append custom className to container', () => {
        const { container } = render(<PageHeader title="Title" className="custom-header" />);
        expect(container.firstChild).toHaveClass('custom-header');
    });
});
