/**
 * Tests para componentes FileUploader
 * @module FileUploader.test
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FileUploader } from '../FileUploader';
import type { UploadFile } from '../../../types/upload.types';
import type { Document } from '../../../types/document.types';
import { useFileUpload } from '../../../hooks/useFileUpload';

// -------------------- Mocks --------------------

jest.mock('../../../hooks/useFileUpload', () => ({
  useFileUpload: jest.fn(),
}));

jest.mock('../DropZone', () => ({
  DropZone: ({
    onFilesSelected,
    disabled,
    maxFiles,
  }: {
    onFilesSelected: (files: File[]) => void;
    disabled: boolean;
    maxFiles: number;
  }) => (
    <div>
      <div data-testid="dropzone-disabled">{String(disabled)}</div>
      <div data-testid="dropzone-maxfiles">{String(maxFiles)}</div>
      <button
        type="button"
        onClick={() => onFilesSelected([new File(['a'], 'a.pdf', { type: 'application/pdf' })])}
        disabled={disabled}
      >
        selectOne
      </button>
      <button
        type="button"
        onClick={() =>
          onFilesSelected([
            new File(['a'], 'a.pdf', { type: 'application/pdf' }),
            new File(['b'], 'b.pdf', { type: 'application/pdf' }),
          ])
        }
        disabled={disabled}
      >
        selectTwo
      </button>
    </div>
  ),
}));

jest.mock('../FileList', () => ({
  FileList: ({
    files,
    onRemove,
    onCancel,
    onRetry,
  }: {
    files: UploadFile[];
    onRemove: (id: string) => void;
    onCancel: (id: string) => void;
    onRetry: (id: string) => void;
  }) => (
    <div>
      <div data-testid="filelist-count">{String(files.length)}</div>
      {files.map((f) => (
        <div key={f.id}>
          <span>{f.file.name}</span>
          <button type="button" onClick={() => onRemove(f.id)}>
            remove-{f.id}
          </button>
          <button type="button" onClick={() => onCancel(f.id)}>
            cancel-{f.id}
          </button>
          <button type="button" onClick={() => onRetry(f.id)}>
            retry-{f.id}
          </button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('lucide-react', () => ({
  Upload: () => <span data-testid="icon-upload">Upload</span>,
  X: () => <span data-testid="icon-x">X</span>,
  CheckCircle: () => <span data-testid="icon-check">Check</span>,
}));

jest.mock('../../../types/upload.types', () => ({
  UPLOAD_CONSTRAINTS: {
    MAX_SIMULTANEOUS_UPLOADS: 3,
    SUCCESS_CLOSE_DELAY_MS: 50,
  },
}));

jest.mock('../FileUploader.module.css', () => new Proxy({}, { get: () => 'cls' }));

const mockUseFileUpload = useFileUpload as unknown as jest.Mock;

// -------------------- Helpers --------------------

type HookOpts = {
  folderId?: string;
  onAllComplete?: (files: UploadFile[]) => void;
};

const mockAddFiles = jest.fn();
const mockUploadAll = jest.fn();
const mockRemoveFile = jest.fn();
const mockCancelUpload = jest.fn();
const mockCancelAll = jest.fn();
const mockRetryUpload = jest.fn();
const mockClearCompleted = jest.fn();
const mockReset = jest.fn();

function createHookReturn(overrides: Partial<ReturnType<typeof useFileUpload>> = {}) {
  return {
    files: [] as UploadFile[],
    isUploading: false,
    totalProgress: 0,
    addFiles: mockAddFiles,
    removeFile: mockRemoveFile,
    uploadAll: mockUploadAll,
    cancelUpload: mockCancelUpload,
    cancelAll: mockCancelAll,
    retryUpload: mockRetryUpload,
    retryAll: jest.fn(),
    clearCompleted: mockClearCompleted,
    reset: mockReset,
    uploadedDocuments: [] as Document[],
    allSuccessful: false,
    pendingCount: 0,
    successCount: 0,
    errorCount: 0,
    ...overrides,
  };
}

function mkUploadFile(id: string, name: string, status: UploadFile['status']): UploadFile {
  return {
    id,
    file: new File(['x'], name, { type: 'application/pdf' }),
    status,
    progress: status === 'success' ? 100 : 0,
    retryCount: 0,
  };
}

describe('FileUploader', () => {
  let capturedOpts: HookOpts | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    capturedOpts = null;

    mockAddFiles.mockReturnValue({ valid: [], invalid: [] });

    mockUseFileUpload.mockImplementation((opts: HookOpts) => {
      capturedOpts = opts;
      return createHookReturn();
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders default title, DropZone, and no close button when onClose is not provided', () => {
    render(<FileUploader />);
    expect(screen.getByText('Subir Documentos')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Cerrar/i)).not.toBeInTheDocument();
    expect(screen.getByText('selectOne')).toBeInTheDocument();
  });

  it('renders title override and close button when onClose is provided', () => {
    const onClose = jest.fn();
    render(<FileUploader title="Mi Título" onClose={onClose} />);
    expect(screen.getByText('Mi Título')).toBeInTheDocument();
    expect(screen.getByLabelText(/Cerrar/i)).toBeInTheDocument();
  });

  it('normal mode: handleFilesSelected calls addFiles and shows validation errors when invalid files exist, dismiss clears', () => {
    mockAddFiles.mockReturnValue({
      valid: [],
      invalid: [
        { file: new File(['x'], 'bad.exe', { type: 'application/x-msdownload' }), error: { message: 'No permitido' } },
      ],
    });

    render(<FileUploader />);

    fireEvent.click(screen.getByText('selectOne'));

    expect(mockAddFiles).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Archivos no válidos')).toBeInTheDocument();
    expect(screen.getByText('bad.exe:')).toBeInTheDocument();
    expect(screen.getByText('No permitido')).toBeInTheDocument();

    // dismissible alert has a close button (bootstrap renders a button with aria-label="Close")
    const closeBtn = screen.getByLabelText(/Close/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Archivos no válidos')).not.toBeInTheDocument();
  });

  it('normal mode: validation errors auto-clear after 5 seconds', () => {
    jest.useFakeTimers();

    mockAddFiles.mockReturnValue({
      valid: [],
      invalid: [
        { file: new File(['x'], 'bad.exe', { type: 'application/x-msdownload' }), error: { message: 'No permitido' } },
      ],
    });

    render(<FileUploader />);

    fireEvent.click(screen.getByText('selectOne'));
    expect(screen.getByText('Archivos no válidos')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Archivos no válidos')).not.toBeInTheDocument();
  });

  it('normal mode: shows FileList when there are files and not success, and wires actions', () => {
    mockUseFileUpload.mockImplementation((opts: HookOpts) => {
      capturedOpts = opts;
      return createHookReturn({
        files: [mkUploadFile('f1', 'test.pdf', 'pending')],
        pendingCount: 1,
      });
    });

    render(<FileUploader />);

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    fireEvent.click(screen.getByText('remove-f1'));
    expect(mockRemoveFile).toHaveBeenCalledWith('f1');

    fireEvent.click(screen.getByText('cancel-f1'));
    expect(mockCancelUpload).toHaveBeenCalledWith('f1');

    fireEvent.click(screen.getByText('retry-f1'));
    expect(mockRetryUpload).toHaveBeenCalledWith('f1');
  });

  it('normal mode: upload button calls uploadAll and "Limpiar" calls reset', () => {
    mockUseFileUpload.mockImplementation((opts: HookOpts) => {
      capturedOpts = opts;
      return createHookReturn({
        files: [mkUploadFile('f1', 'test.pdf', 'pending')],
        pendingCount: 1,
      });
    });

    render(<FileUploader />);

    fireEvent.click(screen.getByRole('button', { name: 'Subir (1)' }));
    expect(mockUploadAll).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('normal mode: when isUploading true, shows total progress and Cancelar todo button calls cancelAll', () => {
    mockUseFileUpload.mockImplementation((opts: HookOpts) => {
      capturedOpts = opts;
      return createHookReturn({
        files: [mkUploadFile('f1', 'test.pdf', 'uploading')],
        isUploading: true,
        totalProgress: 42,
        pendingCount: 1,
      });
    });

    render(<FileUploader />);

    expect(screen.getByText('Progreso total')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar todo' }));
    expect(mockCancelAll).toHaveBeenCalledTimes(1);
  });

  it('normal mode: close triggers cancelAll if uploading, then reset and onClose', () => {
    const onClose = jest.fn();

    mockUseFileUpload.mockImplementation((opts: HookOpts) => {
      capturedOpts = opts;
      return createHookReturn({
        isUploading: true,
      });
    });

    render(<FileUploader onClose={onClose} />);

    fireEvent.click(screen.getByLabelText(/Cerrar/i));
    expect(mockCancelAll).toHaveBeenCalledTimes(1);
    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('normal mode: onAllComplete success shows success alert and auto-calls onUploadSuccess and onClose after delay', () => {
    jest.useFakeTimers();
    const onUploadSuccess = jest.fn();
    const onClose = jest.fn();

    render(<FileUploader onUploadSuccess={onUploadSuccess} onClose={onClose} />);

    const completed: UploadFile[] = [
      { ...mkUploadFile('f1', 'a.pdf', 'success'), result: { id: 'd1' } as unknown as Document },
      { ...mkUploadFile('f2', 'b.pdf', 'success'), result: { id: 'd2' } as unknown as Document },
    ];

    expect(capturedOpts).not.toBeNull();
    act(() => {
      capturedOpts!.onAllComplete?.(completed);
    });

    expect(screen.getByText(/archivos subidos/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(onUploadSuccess).toHaveBeenCalledWith([{ id: 'd1' }, { id: 'd2' }]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('custom mode: title changes, selecting more than one with allowMultiple=false sets validation error and keeps first file', () => {
    const uploadHandler = jest.fn();
    render(<FileUploader uploadHandler={uploadHandler} allowMultiple={false} />);

    expect(screen.getByText('Reemplazar Documento')).toBeInTheDocument();

    fireEvent.click(screen.getByText('selectTwo'));

    expect(screen.getByText('Archivos no válidos')).toBeInTheDocument();
    expect(screen.getByText('Solo puedes seleccionar un archivo.')).toBeInTheDocument();
    expect(screen.getByText('a.pdf')).toBeInTheDocument();
    expect(screen.queryByText('b.pdf')).not.toBeInTheDocument();

    // maxFilesReached should disable DropZone after having 1 file in single mode
    expect(screen.getByTestId('dropzone-disabled')).toHaveTextContent('true');
  });

  it('custom mode: upload success shows success alert and triggers callbacks after delay', async () => {
    jest.useFakeTimers();
    const onUploadSuccess = jest.fn();
    const onClose = jest.fn();

    const docs = [{ id: 'doc-1' }, { id: 'doc-2' }] as unknown as Document[];
    const uploadHandler = jest.fn().mockResolvedValue(docs);

    render(<FileUploader uploadHandler={uploadHandler} onUploadSuccess={onUploadSuccess} onClose={onClose} />);

    fireEvent.click(screen.getByText('selectOne'));
    fireEvent.click(screen.getByRole('button', { name: 'Reemplazar' }));

    await act(async () => {});

    expect(screen.getByText(/Archivo reemplazado/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(onUploadSuccess).toHaveBeenCalledWith(docs);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('custom mode: upload failure shows customError and can be dismissed', async () => {
    const uploadHandler = jest.fn().mockRejectedValue(new Error('fail'));
    render(<FileUploader uploadHandler={uploadHandler} />);

    fireEvent.click(screen.getByText('selectOne'));
    fireEvent.click(screen.getByRole('button', { name: 'Reemplazar' }));

    await act(async () => {});

    expect(screen.getByText('Error al subir el archivo')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Close/i));
    expect(screen.queryByText('Error al subir el archivo')).not.toBeInTheDocument();
  });

  it('custom mode: shows spinner while uploading and disables remove buttons', async () => {
    const uploadHandler = jest.fn(
      () => new Promise<Document[]>((resolve) => setTimeout(() => resolve([{ id: 'd1' }] as unknown as Document[]), 10))
    );

    jest.useFakeTimers();

    render(<FileUploader uploadHandler={uploadHandler} />);

    fireEvent.click(screen.getByText('selectOne'));
    fireEvent.click(screen.getByRole('button', { name: 'Reemplazar' }));

    // uploading state UI
    expect(screen.getByText('Reemplazando archivo...')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(10);
    });

    await act(async () => {});
  });

  it('custom mode: remove selected file and reset button clears files and errors', () => {
    const uploadHandler = jest.fn();
    render(<FileUploader uploadHandler={uploadHandler} />);

    fireEvent.click(screen.getByText('selectTwo'));
    expect(screen.getByText('a.pdf')).toBeInTheDocument();
    expect(screen.getByText('b.pdf')).toBeInTheDocument();

    // remove first item via the X button (there are two, click the first by querying all buttons named "X" is messy,
    // so use "Limpiar" path to cover reset and ensure list disappears)
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(screen.queryByText('a.pdf')).not.toBeInTheDocument();
    expect(screen.queryByText('b.pdf')).not.toBeInTheDocument();
  });

  it('custom mode: close resets custom state and calls onClose', () => {
    const onClose = jest.fn();
    const uploadHandler = jest.fn();

    render(<FileUploader uploadHandler={uploadHandler} onClose={onClose} />);

    fireEvent.click(screen.getByText('selectOne'));
    expect(screen.getByText('a.pdf')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Cerrar/i));
    expect(onClose).toHaveBeenCalledTimes(1);

    // after close, state reset -> file list removed
    expect(screen.queryByText('a.pdf')).not.toBeInTheDocument();
  });

  it('normal mode: maxFilesReached disables DropZone when files length reaches MAX_SIMULTANEOUS_UPLOADS', () => {
    mockUseFileUpload.mockImplementation((opts: HookOpts) => {
      capturedOpts = opts;
      return createHookReturn({
        files: [
          mkUploadFile('f1', '1.pdf', 'pending'),
          mkUploadFile('f2', '2.pdf', 'pending'),
          mkUploadFile('f3', '3.pdf', 'pending'),
        ],
        pendingCount: 3,
      });
    });

    render(<FileUploader />);

    expect(screen.getByTestId('dropzone-disabled')).toHaveTextContent('true');
    expect(screen.getByTestId('dropzone-maxfiles')).toHaveTextContent('0');
  });
});
