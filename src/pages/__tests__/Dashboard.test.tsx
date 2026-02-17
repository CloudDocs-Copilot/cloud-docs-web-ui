import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

// Mock MainLayout
jest.mock('../../components/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>,
}));

// Mock DocumentCard
jest.mock('../../components/DocumentCard', () => ({
  __esModule: true,
  default: function DocumentCard({ document }: { document: { filename?: string; originalname?: string } }) {
    return <div data-testid={`doc-card-${document.filename}`}>{document.filename}</div>;
  },
}));

describe('Dashboard', () => {
  const mockExecute = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: 'org-123' },
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
      </BrowserRouter>
    );

    const loadingTexts = screen.getAllByText('Loading documents...');
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
      </BrowserRouter>
    );

    expect(screen.getByText('Error loading documents')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('renders documents when loaded successfully', async () => {
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
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('doc-card-test1.pdf')).toBeInTheDocument();
      expect(screen.getByTestId('doc-card-test2.docx')).toBeInTheDocument();
    });
  });

  it('fetches documents on mount with organization ID', async () => {
    (useHttpRequestHook.useHttpRequest as jest.Mock).mockReturnValue({
      execute: mockExecute,
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith({
        method: 'GET',
        url: '/documents/recent/org-123',
      });
    });
  });
});
