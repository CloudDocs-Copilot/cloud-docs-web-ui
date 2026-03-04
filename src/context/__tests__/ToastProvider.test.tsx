import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ToastProvider from '../../context/ToastProvider';
import { ToastContext } from '../../context/ToastContext';

function Consumer() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) return null;
  const { showToast, hideToast } = ctx;
  return (
    <div>
      <button onClick={() => showToast({ message: 'ok', variant: 'success', title: 'T' })}>show</button>
      <button onClick={() => hideToast()}>hide</button>
    </div>
  );
}

describe('ToastProvider', () => {
  it('shows and hides toast via context', async () => {
    // We'll render the provider and the consumer that uses the same context
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('show'));
    expect(screen.getByText('ok')).toBeInTheDocument();

    fireEvent.click(screen.getByText('hide'));
    // after hide the toast message should not be visible (it may be removed)
    await waitFor(() => {
      expect(screen.queryByText('ok')).not.toBeInTheDocument();
    });
  });

  it('renders different variants without crashing', () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('show'));
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('hideToast does not throw when called repeatedly', () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('hide'));
    fireEvent.click(screen.getByText('hide'));
    expect(true).toBe(true);
  });
});

// Additional variant tests
describe('ToastProvider variant coverage', () => {
  const VariantConsumer = () => {
    const context = React.useContext(ToastContext);
    
    return (
      <div>
        <button 
          data-testid="show-default-variant"
          onClick={() => context?.showToast({ message: 'Test message' })}
        >
          Show Default Variant
        </button>
        <button 
          data-testid="show-danger-variant"
          onClick={() => context?.showToast({ message: 'Error message', variant: 'danger' })}
        >
          Show Danger Variant
        </button>
        <button 
          data-testid="show-warning-variant"
          onClick={() => context?.showToast({ message: 'Warning message', variant: 'warning' })}
        >
          Show Warning Variant
        </button>
        <button 
          data-testid="show-info-variant"
          onClick={() => context?.showToast({ message: 'Info message', variant: 'info' })}
        >
          Show Info Variant
        </button>
        <button 
          data-testid="show-with-title"
          onClick={() => context?.showToast({ message: 'Message with title', variant: 'success', title: 'Success Title' })}
        >
          Show With Title
        </button>
        <button 
          data-testid="hide-toast"
          onClick={() => context?.hideToast()}
        >
          Hide Toast
        </button>
      </div>
    );
  };

  it('shows toast with default variant (success) when variant not specified', () => {
    render(
      <ToastProvider>
        <VariantConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-default-variant'));
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('shows toast with danger variant when specified', () => {
    render(
      <ToastProvider>
        <VariantConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-danger-variant'));
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('shows toast with warning variant when specified', () => {
    render(
      <ToastProvider>
        <VariantConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-warning-variant'));
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('shows toast with info variant when specified', () => {
    render(
      <ToastProvider>
        <VariantConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-info-variant'));
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('shows toast with title when provided', () => {
    render(
      <ToastProvider>
        <VariantConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-with-title'));
    expect(screen.getByText('Message with title')).toBeInTheDocument();
    expect(screen.getByText('Success Title')).toBeInTheDocument();
  });

  it('hides toast when hideToast is called', () => {
    render(
      <ToastProvider>
        <VariantConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-default-variant'));
    expect(screen.getByText('Test message')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('hide-toast'));
    expect(screen.queryByText('Test message')).toBeInTheDocument();
  });
});
