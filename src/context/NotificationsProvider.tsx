import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NotificationsContext } from './NotificationsContext';
import { useAuth } from '../hooks/useAuth';
import { useOrganization } from '../hooks/useOrganization';
import { useToast } from '../hooks/useToast';
import type { NotificationDTO } from '../types/notification.types';
import * as notificationApi from '../services/notification.service';
import { connectSocket, disconnectSocket } from '../services/socket-client.service';

function safeDateDesc(a?: string, b?: string): number {
  const da = a ? new Date(a).getTime() : 0;
  const db = b ? new Date(b).getTime() : 0;
  return db - da;
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

  // StrictMode guard (avoid double listeners in dev)
  const listenersAttachedRef = useRef(false);

  const recalcUnread = useCallback((items: NotificationDTO[]) => {
    const orgId = activeOrganization?.id;
    const filtered = orgId ? items.filter(n => String(n.organization) === String(orgId)) : items;
    const unread = filtered.filter(n => !n.readAt).length;
    setUnreadCount(unread);
  }, [activeOrganization?.id]);

  const refresh = useCallback(
    async (opts?: { unreadOnly?: boolean }) => {
      if (!isAuthenticated || !user) return;
      if (!activeOrganization?.id) return;

      setLoading(true);
      setError(null);

      try {
        const r = await notificationApi.listNotifications({
          organizationId: activeOrganization.id,
          unreadOnly: opts?.unreadOnly ?? false,
          limit: 20,
          skip: 0,
        });

        const items = (r.notifications ?? []).slice().sort((a, b) => safeDateDesc(a.createdAt, b.createdAt));
        setNotifications(items);
        setTotal(r.total ?? items.length);
        recalcUnread(items);
      } catch (e: unknown) {
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setLoading(false);
      }
    },
    [activeOrganization?.id, isAuthenticated, recalcUnread, user]
  );

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
      } catch (e) {
        // rollback by refetching; simplest + consistent
        await refresh();
      }
    },
    [recalcUnread, refresh]
  );

  const markAllRead = useCallback(async () => {
    if (!activeOrganization?.id) return;

    // Optimistic UI update
    setNotifications(prev => {
      const now = new Date().toISOString();
      const next = prev.map(n => (n.readAt ? n : { ...n, readAt: now }));
      recalcUnread(next);
      return next;
    });

    try {
      await notificationApi.markAllNotificationsRead({ organizationId: activeOrganization.id });
    } catch (e) {
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
      setError(null);
      setLoading(false);
      return;
    }

    const socket = connectSocket();

    if (!listenersAttachedRef.current) {
      listenersAttachedRef.current = true;

      socket.on('socket:connected', () => {
        // Optional: you can refresh on connect once org is ready
      });

      socket.on('notification:new', (payload: NotificationDTO) => {
        // Filter to current active org (if present)
        const activeOrgId = activeOrganization?.id;
        if (activeOrgId && String(payload.organization) !== String(activeOrgId)) return;

        // Show toast
        try {
          const title = 'Notificación';
          const msg = payload.message || 'Tienes una nueva notificación';
          showToast({ title, message: msg, variant: 'info' });
        } catch {
          // ignore toast failures
        }

        // Insert into list (dedupe by id if provided)
        setNotifications(prev => {
          const exists = payload.id ? prev.some(p => p.id === payload.id) : false;
          const next = exists ? prev : [payload, ...prev].slice(0, 20);
          recalcUnread(next);
          return next;
        });

        // total is best-effort client-side
        setTotal(prev => prev + 1);
      });
    }

    return () => {
      // we keep the singleton socket alive while authenticated, so no cleanup here
      // listeners are kept attached (guarded by listenersAttachedRef)
    };
  }, [activeOrganization?.id, isAuthenticated, recalcUnread, showToast, user]);

  // When active org changes, refresh list + reset view
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (!activeOrganization?.id) return;
    refresh().catch(() => {});
  }, [activeOrganization?.id, isAuthenticated, refresh, user]);

  const value = useMemo(
    () => ({
      notifications,
      total,
      unreadCount,
      loading,
      error,
      refresh,
      markRead,
      markAllRead,
    }),
    [notifications, total, unreadCount, loading, error, refresh, markRead, markAllRead]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export default NotificationsProvider;
