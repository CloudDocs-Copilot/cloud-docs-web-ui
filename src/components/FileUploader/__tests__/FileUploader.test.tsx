/**
 * Tests para componentes FileUploader
 * @module FileUploader.test
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { FileUploader } from '../FileUploader';
import type { UploadFile } from '../../../types/upload.types';
import type { Document } from '../../../types/document.types';

// Mock functions
const mockAddFiles = jest.fn();
const mockUploadAll = jest.fn();
const mockRemoveFile = jest.fn();
const mockCancelUpload = jest.fn();
const mockCancelAll = jest.fn();
const mockRetryUpload = jest.fn();
const mockRetryAll = jest.fn();
const mockClearCompleted = jest.fn();
const mockReset = jest.fn();

// Default hook return value
const createMockHookReturn = (overrides = {}) => ({
  files: [] as UploadFile[],
  isUploading: false,
  totalProgress: 0,
  addFiles: mockAddFiles.mockReturnValue({ valid: [], invalid: [] }),
  removeFile: mockRemoveFile,
  uploadAll: mockUploadAll,
  cancelUpload: mockCancelUpload,
  cancelAll: mockCancelAll,
  retryUpload: mockRetryUpload,
  retryAll: mockRetryAll,
  clearCompleted: mockClearCompleted,
  reset: mockReset,
  pendingCount: 0,
  successCount: 0,
  errorCount: 0,
  uploadedDocuments: [] as Document[],
  allSuccessful: false,
  ...overrides,
});

// Mock the hook
jest.mock('../../../hooks/useFileUpload', () => ({
  useFileUpload: jest.fn(),
}));

// Import mock after mocking
import { useFileUpload } from '../../../hooks/useFileUpload';
const mockUseFileUpload = useFileUpload as jest.MockedFunction<typeof useFileUpload>;

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Upload: () => <span data-testid="upload-icon">Upload</span>,
  X: () => <span data-testid="x-icon">X</span>,
  CheckCircle: () => <span data-testid="check-icon">Check</span>,
  File: () => <span data-testid="file-icon">File</span>,
  Trash2: () => <span data-testid="trash-icon">Trash</span>,
  RotateCcw: () => <span data-testid="refresh-icon">Refresh</span>,
  XCircle: () => <span data-testid="x-circle-icon">XCircle</span>,
  AlertCircle: () => <span data-testid="alert-icon">Alert</span>,
  CheckCircle2: () => <span data-testid="check2-icon">Check2</span>,
  Loader: () => <span data-testid="loader-icon">Loader</span>,
  Clock: () => <span data-testid="clock-icon">Clock</span>,
}));

describe('FileUploader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFileUpload.mockReturnValue(createMockHookReturn());
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar el componente correctamente', () => {
      render(<FileUploader />);
      expect(screen.getByText('Subir Documentos')).toBeInTheDocument();
    });

    it('debe mostrar input de archivo', () => {
      render(<FileUploader />);
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });

    it('debe renderizar botón de cerrar si se proporciona onClose', () => {
      const onClose = jest.fn();
      render(<FileUploader onClose={onClose} />);
      const closeButton = screen.getByLabelText(/cerrar/i);
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Interacción con archivos', () => {
    it('debe mostrar archivos en cola', () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      mockUseFileUpload.mockReturnValue(createMockHookReturn({
        files: [
          {
            id: 'file-1',
            file: mockFile,
            status: 'pending' as const,
            progress: 0,
            retryCount: 0,
          },
        ],
        pendingCount: 1,
      }));

      render(<FileUploader />);
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    it('debe llamar addFiles cuando se cambia el input de archivos', () => {
      mockAddFiles.mockReturnValue({ valid: [], invalid: [] });
      render(<FileUploader />);

      const fileInput = document.querySelector('input[type="file"]');
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } });
        expect(mockAddFiles).toHaveBeenCalled();
      }
    });
  });

  describe('Estados de subida', () => {
    it('debe mostrar archivo en estado uploading', () => {
      const mockFile = new File(['content'], 'uploading.pdf', { type: 'application/pdf' });
      mockUseFileUpload.mockReturnValue(createMockHookReturn({
        files: [
          {
            id: 'file-1',
            file: mockFile,
            status: 'uploading' as const,
            progress: 50,
            retryCount: 0,
          },
        ],
        isUploading: true,
      }));

      render(<FileUploader />);
      expect(screen.getByText('uploading.pdf')).toBeInTheDocument();
    });

    it('debe mostrar archivo en estado success', () => {
      const mockFile = new File(['content'], 'success.pdf', { type: 'application/pdf' });
      mockUseFileUpload.mockReturnValue(createMockHookReturn({
        files: [
          {
            id: 'file-1',
            file: mockFile,
            status: 'success' as const,
            progress: 100,
            retryCount: 0,
          },
        ],
        successCount: 1,
      }));

      render(<FileUploader />);
      expect(screen.getByText('success.pdf')).toBeInTheDocument();
    });

    it('debe mostrar archivo en estado error', () => {
      const mockFile = new File(['content'], 'error.pdf', { type: 'application/pdf' });
      mockUseFileUpload.mockReturnValue(createMockHookReturn({
        files: [
          {
            id: 'file-1',
            file: mockFile,
            status: 'error' as const,
            progress: 0,
            retryCount: 1,
            error: { code: 'NETWORK_ERROR' as const, message: 'Error de red' },
          },
        ],
        errorCount: 1,
      }));

      render(<FileUploader />);
      expect(screen.getByText('error.pdf')).toBeInTheDocument();
    });
  });

  describe('Acciones de botones', () => {
    it('debe llamar uploadAll cuando se hace clic en subir', () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      mockUseFileUpload.mockReturnValue(createMockHookReturn({
        files: [
          {
            id: 'file-1',
            file: mockFile,
            status: 'pending' as const,
            progress: 0,
            retryCount: 0,
          },
        ],
        pendingCount: 1,
      }));

      render(<FileUploader />);
      const uploadButton = screen.getByRole('button', { name: /subir/i });
      fireEvent.click(uploadButton);
      expect(mockUploadAll).toHaveBeenCalled();
    });

    it('debe llamar cancelAll y reset cuando se cierra durante subida', () => {
      const onClose = jest.fn();
      mockUseFileUpload.mockReturnValue(createMockHookReturn({
        isUploading: true,
      }));

      render(<FileUploader onClose={onClose} />);
      const closeButton = screen.getByLabelText(/cerrar/i);
      fireEvent.click(closeButton);

      expect(mockCancelAll).toHaveBeenCalled();
      expect(mockReset).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
