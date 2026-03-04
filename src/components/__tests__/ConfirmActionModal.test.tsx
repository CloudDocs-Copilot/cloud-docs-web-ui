import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmActionModal from '../ConfirmActionModal';

describe('ConfirmActionModal', () => {
  it('renders title and children', () => {
    render(<ConfirmActionModal show={true} title="Confirm" onCancel={jest.fn()} onConfirm={jest.fn()}>
      <div>Body</div>
    </ConfirmActionModal>);
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('cancel button calls onCancel', () => {
    const onCancel = jest.fn();
    render(<ConfirmActionModal show={true} title="T" onCancel={onCancel} onConfirm={jest.fn()} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('confirm button calls onConfirm', async () => {
    const onConfirm = jest.fn();
    render(<ConfirmActionModal show={true} title="T" onCancel={jest.fn()} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('shows spinner when processing', () => {
    render(<ConfirmActionModal show={true} title="T" processing={true} onCancel={jest.fn()} onConfirm={jest.fn()} />);
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeDisabled();
  });

  it('allows custom confirm label and variant', () => {
    render(<ConfirmActionModal show={true} title="T" confirmLabel="Do it" confirmVariant="danger" onCancel={jest.fn()} onConfirm={jest.fn()} />);
    expect(screen.getByText('Do it')).toBeInTheDocument();
  });
});
