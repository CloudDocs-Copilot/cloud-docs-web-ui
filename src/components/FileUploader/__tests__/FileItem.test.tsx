import { render, screen, fireEvent } from '@testing-library/react';
import { FileItem } from '../FileItem';
import type { UploadFile } from '../../../types/upload.types';

const makeFile = (name='file.txt', size=100) => ({ name, size, type: 'text/plain' } as File);

describe('FileItem status branches', () => {
  it('shows uploading state with cancel button and progress', () => {
    const file = { id: '1', file: makeFile(), status: 'uploading', progress: 42 } as UploadFile;
    const onRemove = jest.fn();
    const onCancel = jest.fn();
    const onRetry = jest.fn();

    render(<FileItem file={file} onRemove={onRemove} onCancel={onCancel} onRetry={onRetry} />);

    expect(screen.getByLabelText(/Progreso de subida/i)).toBeInTheDocument();
    const cancelBtn = screen.getByLabelText(/Cancelar subida/i);
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledWith('1');
  });

  it('shows error state with retry button and error message', () => {
    const file = { id: '2', file: makeFile(), status: 'error', progress: 0, error: { message: 'Failed' } } as UploadFile;
    const onRemove = jest.fn();
    const onCancel = jest.fn();
    const onRetry = jest.fn();

    render(<FileItem file={file} onRemove={onRemove} onCancel={onCancel} onRetry={onRetry} />);

    expect(screen.getByText(/Failed/i)).toBeInTheDocument();
    const retryBtn = screen.getByLabelText(/Reintentar subida/i);
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledWith('2');
  });

  it('shows success state and remove button calls onRemove', () => {
    const file = { id: '3', file: makeFile('ok.pdf'), status: 'success', progress: 100 } as UploadFile;
    const onRemove = jest.fn();
    const onCancel = jest.fn();
    const onRetry = jest.fn();

    render(<FileItem file={file} onRemove={onRemove} onCancel={onCancel} onRetry={onRetry} />);

    const removeBtn = screen.getByLabelText(/Eliminar archivo de la lista/i);
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledWith('3');
  });

  it('shows cancelled state and retry button', () => {
    const file = { id: '4', file: makeFile('c.txt'), status: 'cancelled', progress: 0 } as UploadFile;
    const onRemove = jest.fn();
    const onCancel = jest.fn();
    const onRetry = jest.fn();

    render(<FileItem file={file} onRemove={onRemove} onCancel={onCancel} onRetry={onRetry} />);

    const retryBtn = screen.getByLabelText(/Reintentar subida/i);
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledWith('4');
  });

  it('shows pending status text', () => {
    const file = { id: '5', file: makeFile('p.txt'), status: 'pending', progress: 0 } as UploadFile;
    const onRemove = jest.fn();
    const onCancel = jest.fn();
    const onRetry = jest.fn();

    render(<FileItem file={file} onRemove={onRemove} onCancel={onCancel} onRetry={onRetry} />);

    expect(screen.getByText(/Pendiente/i)).toBeInTheDocument();
  });
});
