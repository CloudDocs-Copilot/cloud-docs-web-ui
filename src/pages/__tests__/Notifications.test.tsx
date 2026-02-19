import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Notifications from '../Notifications';

const mockRefresh = jest.fn().mockResolvedValue(undefined);
const mockLoadMore = jest.fn().mockResolvedValue(undefined);
const mockMarkRead = jest.fn().mockResolvedValue(undefined);
const mockMarkAllRead = jest.fn().mockResolvedValue(undefined);
const mockNavigate = jest.fn();

jest.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => mockNotificationsState(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/notifications' }),
}));

jest.mock('../../components/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../../hooks/usePageInfoTitle', () => ({ usePageTitle: jest.fn() }));
jest.mock('../../hooks/usePageContext', () => ({ usePageContext: () => ({}) }));

let mockNotificationsState = jest.fn();

describe('Notifications Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotificationsState = jest.fn().mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      hasMore: false,
      refresh: mockRefresh,
      loadMore: mockLoadMore,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });
  });

  it('renders page title', () => {
    render(<Notifications />);
    expect(screen.getByText('Notificaciones')).toBeInTheDocument();
  });

  it('renders empty state when no notifications', () => {
    render(<Notifications />);
    expect(screen.getByText('No tienes notificaciones')).toBeInTheDocument();
  });

  it('renders loading spinner when loading with no notifications', () => {
    mockNotificationsState.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: true,
      hasMore: false,
      refresh: mockRefresh,
      loadMore: mockLoadMore,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });
    render(<Notifications />);
    expect(screen.getByText('Cargando notificaciones...')).toBeInTheDocument();
  });

  it('renders filter tabs', () => {
    render(<Notifications />);
    expect(screen.getByText('Todas')).toBeInTheDocument();
    expect(screen.getByText(/No leídas/)).toBeInTheDocument();
    expect(screen.getByText('Documentos')).toBeInTheDocument();
    expect(screen.getByText('Comentarios')).toBeInTheDocument();
  });

  it('renders notification items', () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: 'n1',
          organization: 'org-1',
          actor: 'u1',
          type: 'DOC_UPLOADED',
          entity: { kind: 'document', id: 'd1' },
          message: 'Test notification',
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      loading: false,
      hasMore: false,
      refresh: mockRefresh,
      loadMore: mockLoadMore,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    render(<Notifications />);
    expect(screen.getByText('Test notification')).toBeInTheDocument();
    expect(screen.getByText('Documento subido')).toBeInTheDocument();
  });

  it('renders new notification types correctly', () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: 'n1',
          organization: 'org-1',
          actor: 'u1',
          type: 'MEMBER_INVITED',
          entity: { kind: 'member', id: 'm1' },
          message: 'Invited a member',
          readAt: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'n2',
          organization: 'org-1',
          actor: 'u1',
          type: 'AI_PROCESSED',
          entity: { kind: 'document', id: 'd1' },
          message: 'AI analysis complete',
          readAt: '2026-01-01T00:00:00.000Z',
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      loading: false,
      hasMore: false,
      refresh: mockRefresh,
      loadMore: mockLoadMore,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    render(<Notifications />);
    expect(screen.getByText('Miembro invitado')).toBeInTheDocument();
    expect(screen.getByText('Análisis IA completado')).toBeInTheDocument();
  });

  it('filters notifications by unread tab', () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: 'n1',
          organization: 'org-1',
          actor: 'u1',
          type: 'DOC_UPLOADED',
          entity: { kind: 'document', id: 'd1' },
          message: 'Unread notification',
          readAt: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'n2',
          organization: 'org-1',
          actor: 'u1',
          type: 'DOC_EDITED',
          entity: { kind: 'document', id: 'd2' },
          message: 'Read notification',
          readAt: '2026-01-01T00:00:00.000Z',
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      loading: false,
      hasMore: false,
      refresh: mockRefresh,
      loadMore: mockLoadMore,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    render(<Notifications />);
    // Click "No leídas" tab
    fireEvent.click(screen.getByText(/No leídas/));
    expect(screen.getByText('Unread notification')).toBeInTheDocument();
    expect(screen.queryByText('Read notification')).not.toBeInTheDocument();
  });

  it('filters by documents tab', () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: 'n1',
          organization: 'org-1',
          actor: 'u1',
          type: 'DOC_UPLOADED',
          entity: { kind: 'document', id: 'd1' },
          message: 'Document uploaded',
          readAt: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'n2',
          organization: 'org-1',
          actor: 'u1',
          type: 'DOC_COMMENTED',
          entity: { kind: 'document', id: 'd2' },
          message: 'Comment added',
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 2,
      loading: false,
      hasMore: false,
      refresh: mockRefresh,
      loadMore: mockLoadMore,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    render(<Notifications />);
    fireEvent.click(screen.getByText('Documentos'));
    expect(screen.getByText('Document uploaded')).toBeInTheDocument();
    expect(screen.queryByText('Comment added')).not.toBeInTheDocument();
  });

  it('marks notification as read on click', async () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: 'n1',
          organization: 'org-1',
          actor: 'u1',
          type: 'DOC_UPLOADED',
          entity: { kind: 'document', id: 'd1' },
          message: 'Click me',
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      loading: false,
      hasMore: false,
      refresh: mockRefresh,
      loadMore: mockLoadMore,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    render(<Notifications />);
    fireEvent.click(screen.getByText('Click me'));
    await waitFor(() => expect(mockMarkRead).toHaveBeenCalledWith('n1'));
  });

  it('shows mark all as read button when there are unread notifications', () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: 'n1',
          organization: 'org-1',
          actor: 'u1',
          type: 'DOC_UPLOADED',
          entity: { kind: 'document', id: 'd1' },
          message: 'Unread',
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      loading: false,
      hasMore: false,
      refresh: mockRefresh,
      loadMore: mockLoadMore,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    render(<Notifications />);
    const markAllButton = screen.getByRole('button', { name: /Marcar todas como leídas/i });
    expect(markAllButton).toBeInTheDocument();
    fireEvent.click(markAllButton);
    expect(mockMarkAllRead).toHaveBeenCalled();
  });

  it('shows load more button when hasMore is true', () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: 'n1',
          organization: 'org-1',
          actor: 'u1',
          type: 'DOC_UPLOADED',
          entity: { kind: 'document', id: 'd1' },
          message: 'Test',
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      loading: false,
      hasMore: true,
      refresh: mockRefresh,
      loadMore: mockLoadMore,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    render(<Notifications />);
    const loadMoreButton = screen.getByRole('button', { name: /Cargar más/i });
    expect(loadMoreButton).toBeInTheDocument();
    fireEvent.click(loadMoreButton);
    expect(mockLoadMore).toHaveBeenCalled();
  });

  it('calls refresh on mount', () => {
    render(<Notifications />);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('navigates to dashboard when clicking document notification', async () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: 'n1',
          organization: 'org-1',
          actor: 'u1',
          type: 'DOC_UPLOADED',
          entity: { kind: 'document', id: 'd1' },
          message: 'Navigate me',
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      loading: false,
      hasMore: false,
      refresh: mockRefresh,
      loadMore: mockLoadMore,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    render(<Notifications />);
    fireEvent.click(screen.getByText('Navigate me'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  });
});
