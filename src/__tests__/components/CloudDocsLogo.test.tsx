import React from 'react';
import { render } from '@testing-library/react';
import { CloudDocsLogo } from '../../components/CloudDocsLogo/CloudDocsLogo';

describe('CloudDocsLogo', () => {
  it('renders SVG element', () => {
    const { container } = render(<CloudDocsLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('uses default size of 28', () => {
    const { container } = render(<CloudDocsLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '28');
    expect(svg).toHaveAttribute('height', '28');
  });

  it('accepts custom size prop', () => {
    const { container } = render(<CloudDocsLogo size={40} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '40');
    expect(svg).toHaveAttribute('height', '40');
  });

  it('accepts custom className prop', () => {
    const { container } = render(<CloudDocsLogo className="custom-class" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-class');
  });

  it('has aria-label for accessibility', () => {
    const { container } = render(<CloudDocsLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-label', 'CloudDocs Copilot Logo');
  });

  it('renders gradients in SVG defs', () => {
    const { container } = render(<CloudDocsLogo />);
    const defs = container.querySelector('defs');
    const gradients = defs?.querySelectorAll('linearGradient');
    expect(gradients?.length).toBeGreaterThan(0);
  });

  it('renders with both custom size and className', () => {
    const { container } = render(
      <CloudDocsLogo size={50} className="logo-large" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '50');
    expect(svg).toHaveAttribute('height', '50');
    expect(svg).toHaveClass('logo-large');
  });
});
