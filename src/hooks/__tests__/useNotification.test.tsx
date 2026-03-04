import React from "react";
import { renderHook } from "@testing-library/react";
import { NotificationsContext } from "../../context/NotificationsContext";
import type { NotificationsContextValue } from "../../context/NotificationsContext";
import useNotifications, {
  useNotifications as useNotificationsNamed,
} from "../useNotifications";

describe("useNotifications", () => {
  it("throws when used outside NotificationsProvider (branch + funcs)", () => {
    expect(() => renderHook(() => useNotificationsNamed())).toThrow(
      "useNotifications must be used within NotificationsProvider",
    );
  });

  it("returns context value when used within NotificationsProvider (branch + funcs)", () => {
    const ctxValue: NotificationsContextValue = {
      notifications: [],
      total: 0,
      unreadCount: 0,
      loading: false,
      error: null,
      hasMore: false,
      refresh: jest.fn<Promise<void>, [opts?: { unreadOnly?: boolean }]>(),
      loadMore: jest.fn<Promise<void>, []>(),
      markRead: jest.fn<Promise<void>, [string]>(),
      markAllRead: jest.fn<Promise<void>, []>(),
    };

    const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
      <NotificationsContext.Provider value={ctxValue}>
        {children}
      </NotificationsContext.Provider>
    );

    const { result } = renderHook(() => useNotificationsNamed(), { wrapper });

    expect(result.current).toBe(ctxValue);
  });

  it("default export behaves the same as named export (extra funcs coverage)", () => {
    const ctxValue: NotificationsContextValue = {
      notifications: [],
      total: 10,
      unreadCount: 3,
      loading: true,
      error: null,
      hasMore: false,
      refresh: jest.fn<Promise<void>, [opts?: { unreadOnly?: boolean }]>(),
      loadMore: jest.fn<Promise<void>, []>(),
      markRead: jest.fn<Promise<void>, [string]>(),
      markAllRead: jest.fn<Promise<void>, []>(),
    };

    const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
      <NotificationsContext.Provider value={ctxValue}>
        {children}
      </NotificationsContext.Provider>
    );

    const { result } = renderHook(() => useNotifications(), { wrapper });

    expect(result.current).toBe(ctxValue);
  });
});
