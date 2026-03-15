import React from 'react';
import { render, screen } from '@testing-library/react';
import { FileList } from '../FileList';
import type { UploadFile } from '../../types/upload.types';

// Mock the FileItem component since we're just testing FileList
jest.mock('../FileItem', () => ({
  FileItem: ({ file }: { file: UploadFile }) => <div data-testid="file-item">{file.name}</div>
}));

describe('FileList', () => {
  const mockOnRemove = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when files array is empty', () => {
    const { container } = render(
      <FileList 
        files={[]} 
        onRemove={mockOnRemove}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders file list container when files exist', () => {
    const mockFiles: UploadFile[] = [
      {
        id: '1',
        name: 'test.pdf',
        size: 1024,
        status: 'uploading',
        progress: 50,
        createdAt: new Date().toISOString()
      }
    ];

    render(
      <FileList 
        files={mockFiles} 
        onRemove={mockOnRemove}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders FileItem for each file', () => {
    const mockFiles: UploadFile[] = [
      {
        id: '1',
        name: 'test1.pdf',
        size: 1024,
        status: 'uploading',
        progress: 50,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'test2.docx',
        size: 2048,
        status: 'completed',
        progress: 100,
        createdAt: new Date().toISOString()
      }
    ];

    render(
      <FileList 
        files={mockFiles} 
        onRemove={mockOnRemove}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
      />
    );

    const fileItems = screen.getAllByTestId('file-item');
    expect(fileItems).toHaveLength(2);
  });

  it('has correct aria-label', () => {
    const mockFiles: UploadFile[] = [
      {
        id: '1',
        name: 'test.pdf',
        size: 1024,
        status: 'completed',
        progress: 100,
        createdAt: new Date().toISOString()
      }
    ];

    render(
      <FileList 
        files={mockFiles} 
        onRemove={mockOnRemove}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Lista de archivos para subir');
  });
});
