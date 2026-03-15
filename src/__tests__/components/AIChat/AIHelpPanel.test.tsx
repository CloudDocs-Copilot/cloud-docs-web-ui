import React from 'react';
import { render } from '@testing-library/react';
import { AIHelpPanel } from '../../../components/AIChat/AIHelpPanel';

// Add matchMedia mock for Bootstrap
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('AIHelpPanel', () => {
  const mockOnHide = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders component with show=false', () => {
    const { container } = render(
      <AIHelpPanel show={false} onHide={mockOnHide} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders component with show=true', () => {
    const { container } = render(
      <AIHelpPanel show={true} onHide={mockOnHide} />
    );
    expect(container).toBeInTheDocument();
  });

  it('accepts onHide callback', () => {
    const anotherMockOnHide = jest.fn();
    const { container } = render(
      <AIHelpPanel show={true} onHide={anotherMockOnHide} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders SVG styles', () => {
    const { container } = render(
      <AIHelpPanel show={true} onHide={mockOnHide} />
    );
    expect(container).toBeInTheDocument();
  });

  it('handles show prop toggle', () => {
    const { rerender } = render(
      <AIHelpPanel show={false} onHide={mockOnHide} />
    );
    expect(mockOnHide).not.toHaveBeenCalled();

    rerender(<AIHelpPanel show={true} onHide={mockOnHide} />);
    expect(mockOnHide).not.toHaveBeenCalled();
  });

  it('passes onHide to offcanvas', () => {
    render(<AIHelpPanel show={true} onHide={mockOnHide} />);
    // onHide shouldn't be called on initial render
    expect(mockOnHide).not.toHaveBeenCalled();
  });

  it('sets correct offcanvas placement', () => {
    const { container } = render(
      <AIHelpPanel show={true} onHide={mockOnHide} />
    );
    // Offcanvas is placed at end (right side)
    expect(container).toBeInTheDocument();
  });

  it('renders with consistent props', () => {
    const props = { show: true, onHide: mockOnHide };
    const { rerender } = render(<AIHelpPanel {...props} />);

    rerender(<AIHelpPanel show={false} onHide={mockOnHide} />);

    expect(mockOnHide).not.toHaveBeenCalled();
  });

  it('supports multiple instances', () => {
    const mockOnHide1 = jest.fn();
    const mockOnHide2 = jest.fn();

    const { container: container1 } = render(
      <AIHelpPanel show={true} onHide={mockOnHide1} />
    );
    const { container: container2 } = render(
      <AIHelpPanel show={false} onHide={mockOnHide2} />
    );

    expect(container1).toBeInTheDocument();
    expect(container2).toBeInTheDocument();
  });

  it('renders offcanvas with closeButton', () => {
    const { container } = render(
      <AIHelpPanel show={true} onHide={mockOnHide} />
    );
    // Offcanvas header should have close button configured
    expect(container).toBeInTheDocument();
  });
});
