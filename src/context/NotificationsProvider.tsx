import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NotificationsContext } from './NotificationsContext';
import { useAuth } from '../hooks/useAuth';
import { useOrganization } from '../hooks/useOrganization';
import { useToast } from '../hooks/useToast';
import type { NotificationDTO, NotificationType } from '../types/notification.types';
import * as notificationApi from '../services/notification.service';
import { connectSocket, disconnectSocket } from '../services/socket-client.service';

function safeDateDesc(a?: string, b?: string): number {
  const da = a ? new Date(a).getTime() : 0;
  const db = b ? new Date(b).getTime() : 0;
  return db - da;
}

const INVITATION_TYPES: NotificationType[] = ['INVITATION_CREATED'];

function isInvitationNotification(n: NotificationDTO): boolean {
  return INVITATION_TYPES.includes(n.type);
}

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { activeOrganization } = useOrganization();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Extra unread count for notifications that belong to other orgs (realtime only).
  // We keep the list filtered to active org + invitations, but still show badge/toast.
  const [extraUnreadCount, setExtraUnreadCount] = useState(0);

  // StrictMode guard (avoid double listeners in dev)
  const listenersAttachedRef = useRef(false);

  const recalcUnread = useCallback((items: NotificationDTO[]) => {
    const unread = items.filter(n => !n.readAt).length;
    setUnreadCount(unread);
  }, []);

  const refresh = useCallback(
    async (opts?: { unreadOnly?: boolean }) => {
      if (!isAuthenticated || !user) return;

      setLoading(true);
      setError(null);

      try {
        const r = await notificationApi.listNotifications({
          // backend returns: (active org notifications) OR (INVITATION_CREATED)
          organizationId: activeOrganization?.id,
          unreadOnly: opts?.unreadOnly ?? false,
          limit: 20,
          skip: 0,
        });

        const items = (r.notifications ?? []).slice().sort((a, b) => safeDateDesc(a.createdAt, b.createdAt));
        setNotifications(items);
        setTotal(r.total ?? items.length);
        setHasMore(items.length < (r.total ?? 0));
        recalcUnread(items);

        // Once we refresh, we consider the badge authoritative for the currently visible scope.
        // Keep extraUnreadCount for other orgs as-is? In practice, resetting avoids confusion.
        setExtraUnreadCount(0);
      } catch (e: unknown) {
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setLoading(false);
      }
    },
    [activeOrganization?.id, isAuthenticated, recalcUnread, user]
  );

  const loadMore = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const r = await notificationApi.listNotifications({
        organizationId: activeOrganization?.id,
        unreadOnly: false,
        limit: 20,
        skip: notifications.length,
      });

      const newItems = (r.notifications ?? []).slice().sort((a, b) => safeDateDesc(a.createdAt, b.createdAt));
      setNotifications(prev => {
        const combined = [...prev, ...newItems];
        recalcUnread(combined);
        return combined;
      });

      const nextTotal = r.total ?? (notifications.length + newItems.length);
      setTotal(nextTotal);
      setHasMore(notifications.length + newItems.length < nextTotal);
    } catch (e: unknown) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [activeOrganization?.id, isAuthenticated, loading, notifications.length, recalcUnread, user]);

  const markRead = useCallback(
    async (id: string) => {
      if (!id) return;

      // Optimistic UI update
      setNotifications(prev => {
        const next = prev.map(n => (n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n));
        recalcUnread(next);
        return next;
      });

      try {
        await notificationApi.markNotificationRead(id);
      } catch {
        // rollback by refetching; simplest + consistent
        await refresh();
      }
    },
    [recalcUnread, refresh]
  );

  const markAllRead = useCallback(async () => {
    setNotifications(prev => {
      const now = new Date().toISOString();
      const next = prev.map(n => (n.readAt ? n : { ...n, readAt: now }));
      recalcUnread(next);
      return next;
    });

    // Marking all read in the visible scope shouldn't clear other-org realtime badge
    setExtraUnreadCount(0);

    try {
      await notificationApi.markAllNotificationsRead({ organizationId: activeOrganization?.id });
    } catch {
      await refresh();
    }
  }, [activeOrganization?.id, recalcUnread, refresh]);

  // Connect / disconnect socket with auth
  useEffect(() => {
    if (!isAuthenticated || !user) {
      listenersAttachedRef.current = false;
      disconnectSocket();
      setNotifications([]);
      setTotal(0);
      setUnreadCount(0);
      setExtraUnreadCount(0);
      setError(null);
      setLoading(false);
      return;
    }

    const socket = connectSocket();

    if (!listenersAttachedRef.current) {
      listenersAttachedRef.current = true;

      socket.on('socket:connected', () => {});

      socket.on('reconnect', () => {
        refresh().catch(() => {});
      });

      socket.on('notification:new', (payload: NotificationDTO) => {
        const activeOrgId = activeOrganization?.id;
        const isInvite = isInvitationNotification(payload);
        const isActiveOrgNotif = activeOrgId && String(payload.organization) === String(activeOrgId);

        // Always toast in realtime (including other-org notifications)
        try {
          const msg = payload.message || 'Tienes una nueva notificación';
          const orgName =
            typeof payload.metadata?.organizationName === 'string'
              ? (payload.metadata.organizationName as string)
              : '';
          const title =
            !isInvite && !isActiveOrgNotif && orgName
              ? `Notificación (${orgName})`
              : 'Notificación';

          showToast({ title, message: msg, variant: 'info' });
        } catch {
          // ignore toast failures
        }

        // Keep invitations always (regardless of org)
        if (isInvite) {
          setNotifications(prev => {
            const exists = payload.id ? prev.some(p => p.id === payload.id) : false;
            const next = exists ? prev : [payload, ...prev].slice(0, 20);
            recalcUnread(next);
            return next;
          });
          setTotal(prev => prev + 1);
          return;
        }

        // If it's for the active org, insert into list.
        if (isActiveOrgNotif) {
          setNotifications(prev => {
            const exists = payload.id ? prev.some(p => p.id === payload.id) : false;
            const next = exists ? prev : [payload, ...prev].slice(0, 20);
            recalcUnread(next);
            return next;
          });
          setTotal(prev => prev + 1);
          return;
        }

        // Otherwise: other-org notification.
        // Don't pollute the current org list, but do bump the badge so the user sees something arrived.
        if (!payload.readAt) {
          setExtraUnreadCount(c => c + 1);
        }
        setTotal(prev => prev + 1);
      });
    }

    return () => {};
  }, [activeOrganization?.id, isAuthenticated, recalcUnread, refresh, showToast, user]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    refresh().catch(() => {});
  }, [activeOrganization?.id, isAuthenticated, refresh, user]);

  const value = useMemo(
    () => ({
      notifications,
      total,
      unreadCount: unreadCount + extraUnreadCount,
      loading,
      error,
      hasMore,
      refresh,
      loadMore,
      markRead,
      markAllRead,
    }),
    [notifications, total, unreadCount, extraUnreadCount, loading, error, hasMore, refresh, loadMore, markRead, markAllRead]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export default NotificationsProvider;
