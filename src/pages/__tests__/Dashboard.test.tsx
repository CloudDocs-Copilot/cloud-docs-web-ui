import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import * as useHttpRequestHook from '../../hooks/useHttpRequest';
import * as useOrganizationHook from '../../hooks/useOrganization';

// Mock hooks
jest.mock('../../hooks/useHttpRequest');
jest.mock('../../hooks/useOrganization');
jest.mock('../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    can: jest.fn().mockReturnValue(true),
    canAny: jest.fn().mockReturnValue(true),
    canAll: jest.fn().mockReturnValue(true),
    role: 'admin',
  }),
}));
jest.mock('../../hooks/usePageInfoTitle', () => ({
  usePageTitle: jest.fn(),
}));

const mockExecute = jest.fn();

// Mock MainLayout (expose onDocumentsUploaded trigger)
jest.mock('../../components/MainLayout', () => ({
  __esModule: true,
  default: ({
    children,
    onDocumentsUploaded,
  }: {
    children: React.ReactNode;
    onDocumentsUploaded?: () => void;
  }) => (
    <div data-testid="main-layout">
      <button
        type="button"
        onClick={() => onDocumentsUploaded && onDocumentsUploaded()}
      >
        trigger-uploaded
      </button>
      {children}
    </div>
  ),
}));

// Mock DocumentCard (expose canDelete + onDeleted trigger)
jest.mock('../../components/DocumentCard', () => ({
  __esModule: true,
  default: function DocumentCard({
    document,
    canDelete,
    onDeleted,
  }: {
    document: { filename?: string; originalname?: string };
    canDelete: boolean;
    onDeleted?: () => void;
  }) {
    return (
      <div>
        <div data-testid={`doc-card-${document.filename}`}>{document.filename}</div>
        <div>{`canDelete:${String(!!canDelete)}`}</div>
        <button type="button" onClick={() => onDeleted && onDeleted()}>
          trigger-deleted
        </button>
      </div>
    );
  },
}));

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: 'org-123', role: 'member' },
      membership: null,
    });

    (useHttpRequestHook.useHttpRequest as jest.Mock).mockReturnValue({
      execute: mockExecute,
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('renders loading state initially', () => {
    (useHttpRequestHook.useHttpRequest as jest.Mock).mockReturnValue({
      execute: mockExecute,
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    const loadingTexts = screen.getAllByText('Cargando documentos...');
    expect(loadingTexts.length).toBeGreaterThan(0);
  });

  it('renders error state when request fails', () => {
    (useHttpRequestHook.useHttpRequest as jest.Mock).mockReturnValue({
      execute: mockExecute,
      data: null,
      isLoading: false,
      isError: true,
      error: { message: 'Network error' },
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(screen.getByText('Error al cargar documentos')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('renders documents when loaded successfully and canDelete=false for member', async () => {
    (useHttpRequestHook.useHttpRequest as jest.Mock).mockReturnValue({
      execute: mockExecute,
      data: {
        success: true,
        count: 2,
        documents: [
          { id: '1', filename: 'test1.pdf' },
          { id: '2', filename: 'test2.docx' },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('doc-card-test1.pdf')).toBeInTheDocument();
      expect(screen.getByTestId('doc-card-test2.docx')).toBeInTheDocument();
    });

    expect(screen.getAllByText('canDelete:false').length).toBeGreaterThan(0);
  });

  it('canDelete=true only for owner role (membership wins; case-insensitive)', async () => {
    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: 'org-123', role: 'member' },
      membership: { role: 'OWNER' },
    });

    (useHttpRequestHook.useHttpRequest as jest.Mock).mockReturnValue({
      execute: mockExecute,
      data: {
        success: true,
        count: 1,
        documents: [{ id: '1', filename: 'test1.pdf' }],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('doc-card-test1.pdf')).toBeInTheDocument();
    });

    expect(screen.getByText('canDelete:true')).toBeInTheDocument();
  });

  it('fetches documents on mount with organization ID', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith({
        method: 'GET',
        url: '/documents/recent/org-123',
      });
    });
  });

  it('does not fetch documents on mount when organization ID is missing (branch)', async () => {
    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: '', role: 'member' },
      membership: null,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockExecute).not.toHaveBeenCalled();
    });
  });

  it('refreshes documents when onDocumentsUploaded and onDeleted callbacks fire', async () => {
    (useHttpRequestHook.useHttpRequest as jest.Mock).mockReturnValue({
      execute: mockExecute,
      data: {
        success: true,
        count: 1,
        documents: [{ id: '1', filename: 'test1.pdf' }],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    // mount fetch
    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith({
        method: 'GET',
        url: '/documents/recent/org-123',
      });
    });

    // trigger upload refresh
    fireEvent.click(screen.getByText('trigger-uploaded'));
    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledTimes(2);
    });

    // trigger delete refresh
    fireEvent.click(screen.getByText('trigger-deleted'));
    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledTimes(3);
    });

    expect(mockExecute).toHaveBeenLastCalledWith({
      method: 'GET',
      url: '/documents/recent/org-123',
    });
  });
});
