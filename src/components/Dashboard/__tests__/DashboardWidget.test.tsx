import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DashboardWidget } from '../DashboardWidget';

describe('DashboardWidget', () => {
  it('renders title and children', () => {
    render(
      <DashboardWidget title="Test Widget">
        <p>Widget content</p>
      </DashboardWidget>,
    );

    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByText('Widget content')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <DashboardWidget title="With Icon" icon={<span data-testid="widget-icon">🔔</span>}>
        <p>Content</p>
      </DashboardWidget>,
    );

    expect(screen.getByTestId('widget-icon')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <DashboardWidget
        title="With Actions"
        actions={<button>Action</button>}
      >
        <p>Content</p>
      </DashboardWidget>,
    );

    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('renders skeleton placeholder when loading=true', () => {
    const { container } = render(
      <DashboardWidget title="Loading Widget" loading>
        <p>Should not be visible</p>
      </DashboardWidget>,
    );

    // Children should not render in loading state
    expect(screen.queryByText('Should not be visible')).not.toBeInTheDocument();

    // Placeholder elements should be rendered
    const placeholders = container.querySelectorAll('.placeholder');
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it('renders children when loading=false', () => {
    render(
      <DashboardWidget title="Not Loading" loading={false}>
        <p>Visible content</p>
      </DashboardWidget>,
    );

    expect(screen.getByText('Visible content')).toBeInTheDocument();
  });

  it('applies custom className to card', () => {
    const { container } = render(
      <DashboardWidget title="Custom Class" className="my-custom-class">
        <p>Content</p>
      </DashboardWidget>,
    );

    expect(container.querySelector('.my-custom-class')).toBeInTheDocument();
  });
});
