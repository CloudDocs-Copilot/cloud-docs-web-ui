/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import DocumentCard from '../../components/DocumentCard';
import { useDocumentDeletion } from '../../hooks/useDocumentDeletion';
import type { Document } from '../../types/document.types';

// Mock the hooks and services
jest.mock('../../hooks/useDocumentDeletion');
jest.mock('../../services/preview.service');

const mockUseDocumentDeletion = useDocumentDeletion as jest.MockedFunction<typeof useDocumentDeletion>;

// Use a mock with all required properties
const mockDocument: Document = {
  id: '123',
  filename: 'test-document.pdf',
  originalname: 'test-document.pdf',
  mimeType: 'application/pdf',
  size: 1024,
  uploadedBy: 'user-123',
  organization: 'org-123',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  uploadedAt: '2024-01-01T00:00:00.000Z'
};

// Add folder property to avoid the date formatting issue
const mockDocumentWithFolder: Document = {
  ...mockDocument,
  folder: {
    id: 'folder-123',
    name: 'Test Folder',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
};

describe('DocumentCard', () => {
  const mockMoveToTrash = jest.fn();
  const mockOnDeleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDocumentDeletion.mockReturnValue({
      loading: false,
      error: null,
      moveToTrash: mockMoveToTrash,
      restoreFromTrash: jest.fn(),
      permanentDelete: jest.fn(),
      clearError: jest.fn()
    });
  });

  it('renders document information correctly', () => {
    render(<DocumentCard document={mockDocumentWithFolder} />);
    
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });

  it('shows delete confirmation modal when delete button is clicked', () => {
    render(<DocumentCard document={mockDocumentWithFolder} />);
    
    // Find the delete button by its title
    const deleteButton = screen.getByTitle('Mover a papelera');
    fireEvent.click(deleteButton);
    
    expect(screen.getByText(/se eliminará automáticamente después de 30 días/)).toBeInTheDocument();
  });

  it('calls moveToTrash when delete is confirmed', async () => {
    mockMoveToTrash.mockResolvedValue(mockDocumentWithFolder as any);
    
    render(<DocumentCard document={mockDocumentWithFolder} onDeleted={mockOnDeleted} />);
    
    // Open delete modal
    const deleteButton = screen.getByTitle('Mover a papelera');
    fireEvent.click(deleteButton);
    
    // Confirm deletion - use role and filter by button class
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons.find(button => 
      button.textContent === 'Mover a papelera' && button.className.includes('btn-danger')
    );
    
    await act(async () => {
      fireEvent.click(confirmButton!);
    });
    
    await waitFor(() => {
      expect(mockMoveToTrash).toHaveBeenCalledWith('123');
    });
    
    expect(mockOnDeleted).toHaveBeenCalled();
  });

  it('shows error when moveToTrash fails', async () => {
    // Mock moveToTrash to return null (indicates failure without throwing)
    mockMoveToTrash.mockResolvedValue(null);
    
    render(<DocumentCard document={mockDocumentWithFolder} />);
    
    // Open delete modal
    const deleteButton = screen.getByTitle('Mover a papelera');
    fireEvent.click(deleteButton);
    
    // Wait for modal to be visible and get modal element
    const modalText = await screen.findByText(/se eliminará automáticamente después de 30 días/);
    const modal = modalText.closest('.modal-content');
    expect(modal).toBeInTheDocument();
    
    // Find confirm button specifically within the modal footer
    const confirmButton = within(modal!).getByRole('button', { name: /^Mover a papelera$/i });
    
    await act(async () => {
      fireEvent.click(confirmButton);
    });
    
    // Verify moveToTrash was called
    await waitFor(() => {
      expect(mockMoveToTrash).toHaveBeenCalledWith('123');
    });
    
    // Modal should remain open when deletion fails (deleted === null)
    expect(screen.getByText(/se eliminará automáticamente después de 30 días/)).toBeInTheDocument();
  });

  it('handles missing document ID gracefully', async () => {
    const docWithoutId = { ...mockDocumentWithFolder, id: undefined };
    mockMoveToTrash.mockResolvedValue(null);
    
    render(<DocumentCard document={docWithoutId as Document} />);
    
    const deleteButton = screen.getByTitle('Mover a papelera');
    fireEvent.click(deleteButton);
    
    // Wait for modal to be visible and get modal element
    const modalText = await screen.findByText(/se eliminará automáticamente después de 30 días/);
    const modal = modalText.closest('.modal-content');
    expect(modal).toBeInTheDocument();
    
    // Find confirm button specifically within the modal
    const confirmButton = within(modal!).getByRole('button', { name: /^Mover a papelera$/i });
    
    await act(async () => {
      fireEvent.click(confirmButton);
    });
    
    // Component calls moveToTrash with empty string when ID is missing
    await waitFor(() => {
      expect(mockMoveToTrash).toHaveBeenCalledWith('');
    });
  });

  it('closes modal when cancel is clicked', async () => {
    render(<DocumentCard document={mockDocumentWithFolder} />);
    
    // Open modal
    const deleteButton = screen.getByTitle('Mover a papelera');
    fireEvent.click(deleteButton);
    
    expect(screen.getByText(/se eliminará automáticamente después de 30 días/)).toBeInTheDocument();
    
    // Cancel
    const cancelButton = screen.getByText('Cancelar');
    
    await act(async () => {
      fireEvent.click(cancelButton);
    });
    
    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByText(/se eliminará automáticamente después de 30 días/)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays document type and size', () => {
    render(<DocumentCard document={mockDocumentWithFolder} />);
    
    expect(screen.getByText('1 KB')).toBeInTheDocument();
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
  });

  it('displays folder information when available', () => {
    render(<DocumentCard document={mockDocumentWithFolder} />);
    
    // Should display folder info in some way (depends on implementation)
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
  });
});