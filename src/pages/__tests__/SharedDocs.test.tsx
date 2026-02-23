import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import Dashboard from '../SharedDocs';

const mockExecute = jest.fn();

type MockHttpState = {
  data: unknown;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
};

let mockHttpState: MockHttpState = {
  data: undefined,
  isLoading: false,
  isError: false,
  error: undefined,
};

jest.mock('../../hooks/useHttpRequest', () => ({
  useHttpRequest: () => ({
    execute: mockExecute,
    data: mockHttpState.data,
    isLoading: mockHttpState.isLoading,
    isError: mockHttpState.isError,
    error: mockHttpState.error,
  }),
}));

const mockUsePageTitle = jest.fn();
jest.mock('../../hooks/usePageInfoTitle', () => ({
  usePageTitle: (args: unknown) => mockUsePageTitle(args),
}));

type OrgReturn = {
  activeOrganization: { role?: string } | null;
  membership: { role?: string } | null;
};

let mockOrgState: OrgReturn = {
  activeOrganization: { role: 'member' },
  membership: null,
};

jest.mock('../../hooks/useOrganization', () => ({
  __esModule: true,
  default: () => mockOrgState,
}));

// MainLayout: simple wrapper
jest.mock('../../components/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>
      <div>{children}</div>
    </div>
  ),
}));

// DocumentCard: expose delete callback + canDelete value
jest.mock('../../components/DocumentCard', () => ({
  __esModule: true,
  default: ({
    document,
    onDeleted,
    canDelete,
  }: {
    document: { originalname?: string; filename: string };
    onDeleted?: () => void;
    canDelete: boolean;
  }) => (
    <div>
      <div>doc:{document.originalname || document.filename}</div>
      <div>canDelete:{String(!!canDelete)}</div>
      <button type="button" onClick={() => onDeleted && onDeleted()}>
        trigger-deleted
      </button>
    </div>
  ),
}));

function setHttp(state: Partial<MockHttpState>) {
  mockHttpState = { ...mockHttpState, ...state };
}

function setOrg(state: Partial<OrgReturn>) {
  mockOrgState = { ...mockOrgState, ...state };
}

describe('SharedDocs (Dashboard)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecute.mockClear();

    // default states
    setHttp({
      data: undefined,
      isLoading: false,
      isError: false,
      error: undefined,
    });
    setOrg({
      activeOrganization: { role: 'member' },
      membership: null,
    });
  });

  it('calls usePageTitle and fetches documents on mount', () => {
    render(<Dashboard />);

    expect(mockUsePageTitle).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Documentos Compartidos',
        documentTitle: 'Documentos Compartidos',
      }),
    );

    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledWith({
      method: 'GET',
      url: '/documents/shared',
    });
  });

  it('renders loading state', () => {
    setHttp({ isLoading: true, isError: false, data: undefined });
    render(<Dashboard />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state with provided error message', () => {
    setHttp({
      isLoading: false,
      isError: true,
      error: { message: 'Boom' },
    });

    render(<Dashboard />);

    expect(screen.getByText('Error loading documents')).toBeInTheDocument();
    expect(screen.getByText('Boom')).toBeInTheDocument();
  });

  it('renders error state with fallback message when error.message is missing', () => {
    setHttp({
      isLoading: false,
      isError: true,
      error: {},
    });

    render(<Dashboard />);

    expect(screen.getByText('Error loading documents')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('renders info alert when there are no shared documents', () => {
    setHttp({
      isLoading: false,
      isError: false,
      data: { success: true, count: 0, documents: [] },
    });

    render(<Dashboard />);

    expect(
      screen.getByText(/Sin documentos compartidos contigo aún/i),
    ).toBeInTheDocument();
  });

  it('renders documents and canDelete=false for member role (default)', () => {
    setHttp({
      isLoading: false,
      isError: false,
      data: {
        success: true,
        count: 2,
        documents: [
          {
            id: 'd1',
            filename: 'a.pdf',
            originalname: 'A.pdf',
            mimeType: 'application/pdf',
            size: 123,
            folder: 'folder_legal',
            uploadedAt: new Date().toISOString(),
          },
          {
            id: 'd2',
            filename: 'b.pdf',
            originalname: 'B.pdf',
            mimeType: 'application/pdf',
            size: 456,
            folder: 'folder_legal',
            uploadedAt: new Date().toISOString(),
          },
        ],
      },
    });

    render(<Dashboard />);

    expect(screen.getByText('doc:A.pdf')).toBeInTheDocument();
    expect(screen.getByText('doc:B.pdf')).toBeInTheDocument();

    // member -> cannot delete
    expect(screen.getAllByText('canDelete:false')).toHaveLength(2);
  });

  it('canDelete=true for owner role (case-insensitive) and refreshes when delete callback fires', () => {
    // Role normalization branch: membership wins; case-insensitive
    setOrg({
      membership: { role: 'OWNER' },
      activeOrganization: { role: 'member' },
    });

    setHttp({
      isLoading: false,
      isError: false,
      data: {
        success: true,
        count: 1,
        documents: [
          {
            id: 'd1',
            filename: 'a.pdf',
            originalname: 'A.pdf',
            mimeType: 'application/pdf',
            size: 123,
            folder: 'folder_legal',
            uploadedAt: new Date().toISOString(),
          },
        ],
      },
    });

    render(<Dashboard />);

    // mount fetch
    expect(mockExecute).toHaveBeenCalledTimes(1);

    // owner -> can delete
    expect(screen.getByText('canDelete:true')).toBeInTheDocument();

    // trigger DocumentCard onDeleted -> should fetch again
    fireEvent.click(screen.getByText('trigger-deleted'));
    expect(mockExecute).toHaveBeenCalledTimes(2);

    // and always same request shape
    expect(mockExecute).toHaveBeenLastCalledWith({
      method: 'GET',
      url: '/documents/shared',
    });
  });

  it('uses activeOrganization.role when membership.role is missing (branch)', () => {
    setOrg({
      membership: null,
      activeOrganization: { role: 'owner' },
    });

    setHttp({
      isLoading: false,
      isError: false,
      data: {
        success: true,
        count: 1,
        documents: [
          {
            id: 'd1',
            filename: 'a.pdf',
            originalname: 'A.pdf',
            mimeType: 'application/pdf',
            size: 123,
            folder: 'folder_legal',
            uploadedAt: new Date().toISOString(),
          },
        ],
      },
    });

    render(<Dashboard />);
    expect(screen.getByText('canDelete:true')).toBeInTheDocument();
  });
});
