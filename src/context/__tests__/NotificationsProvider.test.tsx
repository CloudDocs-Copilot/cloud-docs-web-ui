// NotificationsProvider.test.tsx
import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationsProvider } from '../NotificationsProvider';
import { NotificationsContext } from '../NotificationsContext';
import type { NotificationDTO } from '../../types/notification.types';
import * as notificationApi from '../../services/notification.service';
import { connectSocket, disconnectSocket } from '../../services/socket-client.service';

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../hooks/useOrganization', () => ({
  useOrganization: jest.fn(),
}));

jest.mock('../../hooks/useToast', () => ({
  useToast: jest.fn(),
}));

jest.mock('../../services/notification.service', () => ({
  listNotifications: jest.fn(),
  markNotificationRead: jest.fn(),
  markAllNotificationsRead: jest.fn(),
}));

jest.mock('../../services/socket-client.service', () => ({
  connectSocket: jest.fn(),
  disconnectSocket: jest.fn(),
}));

const { useAuth } = jest.requireMock('../../hooks/useAuth') as {
  useAuth: jest.Mock;
};
const { useOrganization } = jest.requireMock('../../hooks/useOrganization') as {
  useOrganization: jest.Mock;
};
const { useToast } = jest.requireMock('../../hooks/useToast') as {
  useToast: jest.Mock;
};

type SocketHandlerMap = Record<string, Array<(payload?: unknown) => void>>;

function createMockSocket() {
  const handlers: SocketHandlerMap = {};
  return {
    connected: false,
    on: jest.fn((event: string, cb: (payload?: unknown) => void) => {
      handlers[event] = handlers[event] || [];
      handlers[event].push(cb);
    }),
    emitLocal(event: string, payload?: unknown) {
      (handlers[event] || []).forEach((cb) => cb(payload));
    },
    _handlers: handlers,
  };
}

function Consumer() {
  const ctx = React.useContext(NotificationsContext);
  if (!ctx) return null;

  return (
    <div>
      <div data-testid="unread">{ctx.unreadCount}</div>
      <div data-testid="total">{ctx.total}</div>
      <div data-testid="loading">{String(ctx.loading)}</div>
      <div data-testid="error">{ctx.error ? ctx.error.message : ''}</div>

      <button onClick={() => ctx.refresh()} type="button">
        refresh
      </button>
      <button onClick={() => ctx.refresh({ unreadOnly: true })} type="button">
        refreshUnread
      </button>
      <button onClick={() => ctx.markRead('n1')} type="button">
        markRead
      </button>
      <button onClick={() => ctx.markRead('')} type="button">
        markReadEmpty
      </button>
      <button onClick={() => ctx.markAllRead()} type="button">
        markAllRead
      </button>

      <ul data-testid="list">
        {ctx.notifications.map((n) => (
          <li key={n.id ?? `${String(n.type)}-${String(n.createdAt)}-${String(n.actor)}`}>
            {n.message ?? ''}
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <NotificationsProvider>
      <Consumer />
    </NotificationsProvider>
  );
}

describe('NotificationsProvider', () => {
  const listMock = notificationApi.listNotifications as jest.Mock;
  const markReadMock = notificationApi.markNotificationRead as jest.Mock;
  const markAllMock = notificationApi.markAllNotificationsRead as jest.Mock;
  const connectMock = connectSocket as jest.Mock;
  const disconnectMock = disconnectSocket as jest.Mock;

  const showToastMock = jest.fn();

  let socket: ReturnType<typeof createMockSocket>;

  // Use impl vars so we can change values and rerender to hit auth/org effect branches.
  let authState: { isAuthenticated: boolean; user: unknown };
  let orgState: { activeOrganization: unknown };
  let toastState: { showToast: (args: unknown) => void };

  beforeEach(() => {
    jest.clearAllMocks();

    socket = createMockSocket();
    connectMock.mockReturnValue(socket);

    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: { id: 'org-1' } };
    toastState = { showToast: showToastMock };

    useAuth.mockImplementation(() => authState);
    useOrganization.mockImplementation(() => orgState);
    useToast.mockImplementation(() => toastState);
  });

  it('when not authenticated: disconnects, resets state, does not call refresh', async () => {
    authState = { isAuthenticated: false, user: null };
    orgState = { activeOrganization: { id: 'org-1' } };

    renderWithProvider();

    expect(disconnectMock).toHaveBeenCalledTimes(1);
    expect(connectMock).not.toHaveBeenCalled();

    expect(screen.getByTestId('unread')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('');
    expect(listMock).not.toHaveBeenCalled();
  });

  it('auth effect: authenticated but missing user triggers disconnect/reset branch', async () => {
    authState = { isAuthenticated: true, user: null };
    orgState = { activeOrganization: { id: 'org-1' } };

    renderWithProvider();

    expect(disconnectMock).toHaveBeenCalledTimes(1);
    expect(connectMock).not.toHaveBeenCalled();
    expect(listMock).not.toHaveBeenCalled();

    expect(screen.getByTestId('unread')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('refresh: early returns when missing auth/user/org (manual refresh call)', async () => {
    authState = { isAuthenticated: false, user: null };
    orgState = { activeOrganization: { id: 'org-1' } };

    renderWithProvider();

    fireEvent.click(screen.getByText('refresh'));
    await act(async () => {});

    expect(listMock).not.toHaveBeenCalled();

    // also: authenticated but missing org id
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: null };

    const { rerender } = renderWithProvider();
    rerender(
      <NotificationsProvider>
        <Consumer />
      </NotificationsProvider>
    );

    await act(async () => {});

    expect(listMock).not.toHaveBeenCalled();
  });

  it('org-change effect: early returns when missing org id (does not auto refresh)', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: null };

    renderWithProvider();

    // should not auto refresh
    await act(async () => {});
    expect(listMock).not.toHaveBeenCalled();
  });

  it('refresh: loads notifications, sorts desc by createdAt, sets total and unread (filtered by active org)', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: { id: 'org-1' } };

    const n1 = {
      id: 'a',
      organization: 'org-1',
      message: 'older',
      createdAt: '2026-02-13T00:00:00.000Z',
      readAt: undefined,
      actor: 'u2',
      type: 'DOC_UPLOADED',
    } as unknown as NotificationDTO;

    const n2 = {
      id: 'b',
      organization: 'org-1',
      message: 'newer',
      createdAt: '2026-02-14T00:00:00.000Z',
      readAt: '2026-02-14T02:00:00.000Z',
      actor: 'u2',
      type: 'DOC_UPLOADED',
    } as unknown as NotificationDTO;

    const otherOrg = {
      id: 'c',
      organization: 'org-2',
      message: 'other-org-unread',
      createdAt: '2026-02-15T00:00:00.000Z',
      readAt: undefined,
      actor: 'u3',
      type: 'DOC_UPLOADED',
    } as unknown as NotificationDTO;

    listMock.mockResolvedValueOnce({
      success: true,
      notifications: [n1, n2, otherOrg],
      total: 123,
    });

    renderWithProvider();

    // Org change effect triggers refresh automatically
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));

    // Unread should only count for org-1 (n1 unread, n2 read)
    expect(screen.getByTestId('unread')).toHaveTextContent('1');
    expect(screen.getByTestId('total')).toHaveTextContent('123');

    // Sorted by createdAt desc: otherOrg, newer, older
    const items = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toEqual(['other-org-unread', 'newer', 'older']);
  });

  it('refresh: uses unreadOnly default false when opts is undefined + uses total fallback when r.total is undefined', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: { id: 'org-1' } };

    const nNoDate = {
      id: 'n1',
      organization: 'org-1',
      message: 'no-date',
      createdAt: undefined,
      readAt: undefined,
      actor: 'u2',
      type: 'DOC_UPLOADED',
    } as unknown as NotificationDTO;

    // r.total undefined -> total should fall back to items.length (1)
    listMock.mockResolvedValueOnce({
      success: true,
      notifications: [nNoDate],
      total: undefined,
    });

    renderWithProvider();

    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));
    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'org-1',
        unreadOnly: false,
        limit: 20,
        skip: 0,
      })
    );

    expect(screen.getByTestId('total')).toHaveTextContent('1');
    expect(screen.getByTestId('unread')).toHaveTextContent('1');
    expect(screen.getByText('no-date')).toBeInTheDocument();
  });

  it('refresh: uses unreadOnly param when provided', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: { id: 'org-1' } };

    listMock.mockResolvedValueOnce({ success: true, notifications: [], total: 0 });

    renderWithProvider();
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));

    listMock.mockResolvedValueOnce({ success: true, notifications: [], total: 0 });

    fireEvent.click(screen.getByText('refreshUnread'));

    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    expect(listMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        organizationId: 'org-1',
        unreadOnly: true,
        limit: 20,
        skip: 0,
      })
    );
  });

  it('refresh: sets error when api throws non-Error', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: { id: 'org-1' } };

    listMock.mockRejectedValueOnce('boom');

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('boom'));
  });

  it('refresh: sets error when api throws an Error instance (instanceof Error branch)', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: { id: 'org-1' } };

    listMock.mockRejectedValueOnce(new Error('real-error'));

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('real-error'));
  });

  it('connect socket on auth, attach listeners once, handle notification:new (dedupe, org filter, toast)', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: { id: 'org-1' } };

    listMock.mockResolvedValueOnce({ success: true, notifications: [], total: 0 });

    const { rerender } = renderWithProvider();

    await waitFor(() => expect(connectMock).toHaveBeenCalledTimes(1));
    expect(socket.on).toHaveBeenCalledWith('socket:connected', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('reconnect', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('notification:new', expect.any(Function));

    // rerender while authenticated -> listeners should NOT attach again (listenersAttachedRef branch)
    rerender(
      <NotificationsProvider>
        <Consumer />
      </NotificationsProvider>
    );
    expect(socket.on).toHaveBeenCalledTimes(3);

    // different org should be ignored
    act(() => {
      socket.emitLocal(
        'notification:new',
        {
          id: 'x',
          organization: 'org-2',
          message: 'ignore',
          createdAt: '2026-02-14T00:00:00.000Z',
          readAt: undefined,
          actor: 'u9',
          type: 'DOC_UPLOADED',
        } as unknown as NotificationDTO
      );
    });

    expect(screen.queryByText('ignore')).not.toBeInTheDocument();
    expect(showToastMock).not.toHaveBeenCalled();

    // same org should insert, toast, increment total, unread
    act(() => {
      socket.emitLocal(
        'notification:new',
        {
          id: 'n1',
          organization: 'org-1',
          message: 'hello',
          createdAt: '2026-02-14T00:00:00.000Z',
          readAt: undefined,
          actor: 'u9',
          type: 'DOC_UPLOADED',
        } as unknown as NotificationDTO
      );
    });

    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Notificación',
        message: 'hello',
        variant: 'info',
      })
    );
    expect(screen.getByTestId('unread')).toHaveTextContent('1');
    expect(screen.getByTestId('total')).toHaveTextContent('1');

    // dedupe by id
    act(() => {
      socket.emitLocal(
        'notification:new',
        {
          id: 'n1',
          organization: 'org-1',
          message: 'hello',
          createdAt: '2026-02-14T00:00:00.000Z',
          readAt: undefined,
          actor: 'u9',
          type: 'DOC_UPLOADED',
        } as unknown as NotificationDTO
      );
    });

    expect(screen.getAllByText('hello')).toHaveLength(1);
  });

  it('notification:new: when no active org id, it does NOT filter; when message missing, uses fallback; when id missing, no dedupe; list trims to 20', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: null };

    listMock.mockResolvedValueOnce({ success: true, notifications: [], total: 0 });

    renderWithProvider();
    await waitFor(() => expect(connectMock).toHaveBeenCalledTimes(1));

    // build up 21 notifications to hit slice(0, 20)
    act(() => {
      for (let i = 0; i < 21; i++) {
        socket.emitLocal(
          'notification:new',
          {
            // id omitted => exists=false branch
            organization: i % 2 === 0 ? 'org-999' : 'org-abc',
            message: i === 0 ? undefined : `m${i}`,
            createdAt: `2026-02-14T00:00:00.000Z`,
            readAt: undefined,
            actor: 'u9',
            type: 'DOC_UPLOADED',
          } as unknown as NotificationDTO
        );
      }
    });

    // should keep only 20 items
    expect(screen.getAllByRole('listitem')).toHaveLength(20);

    // toast should have been called, even when message missing (fallback branch)
    // first payload had no message => fallback "Tienes una nueva notificación"
    expect(showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Notificación',
        message: 'Tienes una nueva notificación',
        variant: 'info',
      })
    );
  });

  it('notification:new: toast failure is ignored (does not crash)', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: { id: 'org-1' } };

    toastState = {
      showToast: () => {
        throw new Error('toast failed');
      },
    };

    listMock.mockResolvedValueOnce({ success: true, notifications: [], total: 0 });

    renderWithProvider();
    await waitFor(() => expect(connectMock).toHaveBeenCalled());

    act(() => {
      socket.emitLocal(
        'notification:new',
        {
          id: 'n1',
          organization: 'org-1',
          message: 'still-inserts',
          createdAt: '2026-02-14T00:00:00.000Z',
          readAt: undefined,
          actor: 'u9',
          type: 'DOC_UPLOADED',
        } as unknown as NotificationDTO
      );
    });

    expect(screen.getByText('still-inserts')).toBeInTheDocument();
  });

  it('auth effect: switching from authenticated -> not authenticated resets state and disconnects', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: { id: 'org-1' } };

    listMock.mockResolvedValueOnce({ success: true, notifications: [], total: 0 });

    const { rerender } = renderWithProvider();
    await waitFor(() => expect(connectMock).toHaveBeenCalledTimes(1));

    // emit one notification to change state
    act(() => {
      socket.emitLocal(
        'notification:new',
        {
          id: 'n1',
          organization: 'org-1',
          message: 'hello',
          createdAt: '2026-02-14T00:00:00.000Z',
          readAt: undefined,
          actor: 'u9',
          type: 'DOC_UPLOADED',
        } as unknown as NotificationDTO
      );
    });

    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByTestId('unread')).toHaveTextContent('1');

    // now switch to unauthenticated
    authState = { isAuthenticated: false, user: null };

    rerender(
      <NotificationsProvider>
        <Consumer />
      </NotificationsProvider>
    );

    expect(disconnectMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('unread')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.queryByText('hello')).not.toBeInTheDocument();
  });

  it('markRead: early return when id is empty', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: { id: 'org-1' } };

    listMock.mockResolvedValueOnce({ success: true, notifications: [], total: 0 });

    renderWithProvider();
    await waitFor(() => expect(listMock).toHaveBeenCalled());

    fireEvent.click(screen.getByText('markReadEmpty'));
    expect(markReadMock).not.toHaveBeenCalled();
  });

  it('markRead: optimistic update + api call success (readAt ?? now branch)', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: { id: 'org-1' } };

    const items: NotificationDTO[] = [
      {
        id: 'n1',
        organization: 'org-1',
        message: 'm1',
        createdAt: '2026-02-14T00:00:00.000Z',
        readAt: undefined,
        actor: 'u2',
        type: 'DOC_UPLOADED',
      } as unknown as NotificationDTO,
      {
        id: 'n2',
        organization: 'org-1',
        message: 'already-read',
        createdAt: '2026-02-14T00:00:00.000Z',
        readAt: '2026-02-14T03:00:00.000Z',
        actor: 'u2',
        type: 'DOC_UPLOADED',
      } as unknown as NotificationDTO,
    ];

    listMock.mockResolvedValueOnce({ success: true, notifications: items, total: 2 });
    markReadMock.mockResolvedValueOnce({ success: true });

    renderWithProvider();
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByText('markRead'));

    await waitFor(() => expect(markReadMock).toHaveBeenCalledWith('n1'));
    await waitFor(() => expect(screen.getByTestId('unread')).toHaveTextContent('0'));
  });

  it('markRead: api failure triggers refresh rollback', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: { id: 'org-1' } };

    const unreadItem = {
      id: 'n1',
      organization: 'org-1',
      message: 'm1',
      createdAt: '2026-02-14T00:00:00.000Z',
      readAt: undefined,
      actor: 'u2',
      type: 'DOC_UPLOADED',
    } as unknown as NotificationDTO;

    listMock
      .mockResolvedValueOnce({ success: true, notifications: [unreadItem], total: 1 })
      .mockResolvedValueOnce({ success: true, notifications: [unreadItem], total: 1 });

    markReadMock.mockRejectedValueOnce(new Error('fail'));

    renderWithProvider();
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByText('markRead'));

    await waitFor(() => expect(markReadMock).toHaveBeenCalledWith('n1'));
  });

  it('markAllRead: early return when no active org', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: null };

    renderWithProvider();

    fireEvent.click(screen.getByText('markAllRead'));
    expect(markAllMock).not.toHaveBeenCalled();
  });

  it('markAllRead: optimistic update sets all read + api success branch', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: { id: 'org-1' } };

    const unread1 = {
      id: 'a',
      organization: 'org-1',
      message: 'a',
      createdAt: '2026-02-14T00:00:00.000Z',
      readAt: undefined,
      actor: 'u2',
      type: 'DOC_UPLOADED',
    } as unknown as NotificationDTO;

    const alreadyRead = {
      id: 'b',
      organization: 'org-1',
      message: 'b',
      createdAt: '2026-02-14T01:00:00.000Z',
      readAt: '2026-02-14T02:00:00.000Z',
      actor: 'u2',
      type: 'DOC_UPLOADED',
    } as unknown as NotificationDTO;

    listMock.mockResolvedValueOnce({ success: true, notifications: [unread1, alreadyRead], total: 2 });
    markAllMock.mockResolvedValueOnce({ success: true });

    renderWithProvider();
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('unread')).toHaveTextContent('1');

    fireEvent.click(screen.getByText('markAllRead'));

    await waitFor(() => expect(markAllMock).toHaveBeenCalledWith({ organizationId: 'org-1' }));
    await waitFor(() => expect(screen.getByTestId('unread')).toHaveTextContent('0'));
  });

  it('markAllRead: optimistic update + api call, failure triggers refresh', async () => {
    authState = { isAuthenticated: true, user: { id: 'u1' } };
    orgState = { activeOrganization: { id: 'org-1' } };

    const unread1 = {
      id: 'a',
      organization: 'org-1',
      message: 'a',
      createdAt: '2026-02-14T00:00:00.000Z',
      readAt: undefined,
      actor: 'u2',
      type: 'DOC_UPLOADED',
    } as unknown as NotificationDTO;

    const unread2 = {
      id: 'b',
      organization: 'org-1',
      message: 'b',
      createdAt: '2026-02-14T01:00:00.000Z',
      readAt: undefined,
      actor: 'u2',
      type: 'DOC_UPLOADED',
    } as unknown as NotificationDTO;

    listMock
      .mockResolvedValueOnce({ success: true, notifications: [unread1, unread2], total: 2 })
      .mockResolvedValueOnce({ success: true, notifications: [unread1, unread2], total: 2 });

    markAllMock.mockRejectedValueOnce(new Error('fail'));

    renderWithProvider();
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByText('markAllRead'));

    await waitFor(() => expect(screen.getByTestId('unread')).toHaveTextContent('0'));
    await waitFor(() => expect(markAllMock).toHaveBeenCalledWith({ organizationId: 'org-1' }));
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
  });
});
