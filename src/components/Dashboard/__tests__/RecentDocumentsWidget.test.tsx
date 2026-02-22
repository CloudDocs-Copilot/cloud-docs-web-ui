import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { RecentDocumentsWidget } from '../widgets/RecentDocumentsWidget';
import * as useHttpRequestHook from '../../../hooks/useHttpRequest';
import * as useOrganizationHook from '../../../hooks/useOrganization';
import * as usePermissionsHook from '../../../hooks/usePermissions';

jest.mock('../../../hooks/useHttpRequest');
jest.mock('../../../hooks/useOrganization');
jest.mock('../../../hooks/usePermissions', () => ({
  usePermissions: jest.fn(),
}));

jest.mock('../../DocumentCard', () => ({
  __esModule: true,
  default: ({
    document,
    canDelete,
  }: {
    document: { filename?: string };
    canDelete: boolean;
  }) => (
    <div>
      <span data-testid={`doc-${document.filename}`}>{document.filename}</span>
      <span>{`canDelete:${String(canDelete)}`}</span>
    </div>
  ),
}));

const mockExecute = jest.fn();

describe('RecentDocumentsWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: 'org-1', role: 'member' },
    });

    (usePermissionsHook.usePermissions as jest.Mock).mockReturnValue({
      can: (action: string) => action === 'documents:delete',
      role: 'admin',
    });

    (useHttpRequestHook.useHttpRequest as jest.Mock).mockReturnValue({
      execute: mockExecute,
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('fetches documents on mount with org ID', async () => {
    render(
      <BrowserRouter>
        <RecentDocumentsWidget />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith({
        method: 'GET',
        url: '/documents/recent/org-1',
      });
    });
  });

  it('renders loading spinner when loading', () => {
    (useHttpRequestHook.useHttpRequest as jest.Mock).mockReturnValue({
      execute: mockExecute,
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <RecentDocumentsWidget />
      </BrowserRouter>,
    );

    const loadingTexts = screen.getAllByText('Cargando documentos...');
    expect(loadingTexts.length).toBeGreaterThan(0);
  });

  it('renders error state', () => {
    (useHttpRequestHook.useHttpRequest as jest.Mock).mockReturnValue({
      execute: mockExecute,
      data: null,
      isLoading: false,
      isError: true,
      error: { message: 'Network error' },
    });

    render(
      <BrowserRouter>
        <RecentDocumentsWidget />
      </BrowserRouter>,
    );

    expect(screen.getByText('Error al cargar documentos')).toBeInTheDocument();
  });

  it('renders documents and passes canDelete from permissions', async () => {
    (useHttpRequestHook.useHttpRequest as jest.Mock).mockReturnValue({
      execute: mockExecute,
      data: {
        success: true,
        count: 2,
        documents: [
          { id: '1', filename: 'doc1.pdf', uploadedAt: new Date().toISOString() },
          { id: '2', filename: 'doc2.docx', uploadedAt: new Date().toISOString() },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <RecentDocumentsWidget />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('doc-doc1.pdf')).toBeInTheDocument();
      expect(screen.getByTestId('doc-doc2.docx')).toBeInTheDocument();
    });

    expect(screen.getAllByText('canDelete:true').length).toBe(2);
  });

  it('renders empty state when no documents', async () => {
    (useHttpRequestHook.useHttpRequest as jest.Mock).mockReturnValue({
      execute: mockExecute,
      data: { success: true, count: 0, documents: [] },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <RecentDocumentsWidget />
      </BrowserRouter>,
    );

    expect(screen.getByText(/No se encontraron documentos/)).toBeInTheDocument();
  });

  it('does not fetch when orgId is empty', async () => {
    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: '', role: 'member' },
    });

    render(
      <BrowserRouter>
        <RecentDocumentsWidget />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockExecute).not.toHaveBeenCalled();
    });
  });
});
