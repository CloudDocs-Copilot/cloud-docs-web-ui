// Notifications.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Notifications from "../Notifications";

const mockRefresh = jest.fn().mockResolvedValue(undefined);
const mockLoadMore = jest.fn().mockResolvedValue(undefined);
const mockMarkRead = jest.fn().mockResolvedValue(undefined);
const mockMarkAllRead = jest.fn().mockResolvedValue(undefined);
const mockNavigate = jest.fn();

let mockNotificationsState = jest.fn();

jest.mock("../../hooks/useNotifications", () => ({
  useNotifications: () => mockNotificationsState(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/notifications" }),
}));

jest.mock("../../components/MainLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("../../hooks/usePageInfoTitle", () => ({ usePageTitle: jest.fn() }));

jest.mock("../../constants/notificationTypes", () => ({
  getNotificationTypeInfo: (type: string) => ({
    label: `LABEL:${type}`,
    icon: "🔔",
    bgColor: "pink",
  }),
}));

describe("Notifications Page", () => {
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

  it("renders page title", () => {
    render(<Notifications />);
    expect(screen.getByText("Notificaciones")).toBeInTheDocument();
  });

  it("calls refresh on mount", () => {
    render(<Notifications />);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("renders empty state when no notifications and not loading", () => {
    render(<Notifications />);
    expect(screen.getByText("No tienes notificaciones")).toBeInTheDocument();
  });

  it("renders loading spinner when loading with no notifications", () => {
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
    expect(screen.getByText("Cargando notificaciones...")).toBeInTheDocument();
  });

  it("renders filter tabs", () => {
    render(<Notifications />);
    expect(screen.getByText("Todas")).toBeInTheDocument();
    expect(screen.getByText(/No leídas/)).toBeInTheDocument();
    expect(screen.getByText("Documentos")).toBeInTheDocument();
    expect(screen.getByText("Comentarios")).toBeInTheDocument();
  });

  it("shows unread count badge on 'No leídas' tab when unreadCount > 0", () => {
    mockNotificationsState.mockReturnValue({
      notifications: [],
      unreadCount: 3,
      loading: false,
      hasMore: false,
      refresh: mockRefresh,
      loadMore: mockLoadMore,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    render(<Notifications />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders notification items using getNotificationTypeInfo labels and shows 'Nuevo' badge for unread", () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: "n1",
          organization: "org-1",
          actor: "u1",
          type: "DOC_UPLOADED",
          entity: { kind: "document", id: "d1" },
          message: "Test notification",
          readAt: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: "n2",
          organization: "org-1",
          actor: "u1",
          type: "DOC_EDITED",
          entity: { kind: "document", id: "d2" },
          message: "Already read",
          readAt: "2026-01-01T00:00:00.000Z",
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

    expect(screen.getByText("Test notification")).toBeInTheDocument();
    expect(screen.getByText("Already read")).toBeInTheDocument();

    expect(screen.getByText("LABEL:DOC_UPLOADED")).toBeInTheDocument();
    expect(screen.getByText("LABEL:DOC_EDITED")).toBeInTheDocument();

    // "Nuevo" appears for unread item
    expect(screen.getByText("Nuevo")).toBeInTheDocument();
  });

  it("shows fallback message when notification.message is empty/undefined", () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: "n1",
          organization: "org-1",
          actor: "u1",
          type: "DOC_UPLOADED",
          entity: { kind: "document", id: "d1" },
          message: "",
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
    expect(screen.getByText("Tienes una notificación")).toBeInTheDocument();
  });

  it("filters notifications by unread tab", () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: "n1",
          organization: "org-1",
          actor: "u1",
          type: "DOC_UPLOADED",
          entity: { kind: "document", id: "d1" },
          message: "Unread notification",
          readAt: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: "n2",
          organization: "org-1",
          actor: "u1",
          type: "DOC_EDITED",
          entity: { kind: "document", id: "d2" },
          message: "Read notification",
          readAt: "2026-01-01T00:00:00.000Z",
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

    fireEvent.click(screen.getByText(/No leídas/));
    expect(screen.getByText("Unread notification")).toBeInTheDocument();
    expect(screen.queryByText("Read notification")).not.toBeInTheDocument();
  });

  it("filters by documents tab (DOC_UPLOADED, DOC_EDITED)", () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: "n1",
          organization: "org-1",
          actor: "u1",
          type: "DOC_UPLOADED",
          entity: { kind: "document", id: "d1" },
          message: "Document uploaded",
          readAt: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: "n2",
          organization: "org-1",
          actor: "u1",
          type: "DOC_COMMENTED",
          entity: { kind: "document", id: "d2" },
          message: "Comment added",
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

    fireEvent.click(screen.getByText("Documentos"));
    expect(screen.getByText("Document uploaded")).toBeInTheDocument();
    expect(screen.queryByText("Comment added")).not.toBeInTheDocument();
  });

  it("filters by comments tab (DOC_COMMENTED)", () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: "n1",
          organization: "org-1",
          actor: "u1",
          type: "DOC_UPLOADED",
          entity: { kind: "document", id: "d1" },
          message: "Document uploaded",
          readAt: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: "n2",
          organization: "org-1",
          actor: "u1",
          type: "DOC_COMMENTED",
          entity: { kind: "document", id: "d2" },
          message: "Comment added",
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

    fireEvent.click(screen.getByText("Comentarios"));
    expect(screen.getByText("Comment added")).toBeInTheDocument();
    expect(screen.queryByText("Document uploaded")).not.toBeInTheDocument();
  });

  it("marks notification as read on click only when id exists and it is unread; then navigates to dashboard for document entity", async () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: "n1",
          organization: "org-1",
          actor: "u1",
          type: "DOC_UPLOADED",
          entity: { kind: "document", id: "d1" },
          message: "Click me",
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

    fireEvent.click(screen.getByText("Click me"));
    await waitFor(() => expect(mockMarkRead).toHaveBeenCalledWith("n1"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("does not call markRead when notification already read, but still navigates to dashboard for document entity", async () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: "n1",
          organization: "org-1",
          actor: "u1",
          type: "DOC_UPLOADED",
          entity: { kind: "document", id: "d1" },
          message: "Navigate me",
          readAt: "2026-01-01T00:00:00.000Z",
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 0,
      loading: false,
      hasMore: false,
      refresh: mockRefresh,
      loadMore: mockLoadMore,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    render(<Notifications />);

    fireEvent.click(screen.getByText("Navigate me"));
    expect(mockMarkRead).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("navigates to /invitations when clicking invitation notification (and marks read if unread)", async () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: "inv1",
          organization: "org-1",
          actor: "u1",
          type: "INVITATION_CREATED",
          entity: { kind: "organization", id: "org-1" },
          message: "Invite",
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

    fireEvent.click(screen.getByText("Invite"));
    await waitFor(() => expect(mockMarkRead).toHaveBeenCalledWith("inv1"));
    expect(mockNavigate).toHaveBeenCalledWith("/invitations");
  });

  it("supports keyboard interaction: pressing Enter triggers click handler", async () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: "n1",
          organization: "org-1",
          actor: "u1",
          type: "DOC_UPLOADED",
          entity: { kind: "document", id: "d1" },
          message: "Enter me",
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

    const row = screen.getByText("Enter me").closest('[role="button"]');
    expect(row).toBeTruthy();

    fireEvent.keyDown(row as Element, { key: "Enter" });

    await waitFor(() => expect(mockMarkRead).toHaveBeenCalledWith("n1"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("shows mark all as read button only when unreadCount > 0", () => {
    mockNotificationsState.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      hasMore: false,
      refresh: mockRefresh,
      loadMore: mockLoadMore,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    const { rerender } = render(<Notifications />);
    expect(
      screen.queryByRole("button", { name: /Marcar todas como leídas/i }),
    ).not.toBeInTheDocument();

    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: "n1",
          organization: "org-1",
          actor: "u1",
          type: "DOC_UPLOADED",
          entity: { kind: "document", id: "d1" },
          message: "Unread",
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

    rerender(<Notifications />);

    const markAllButton = screen.getByRole("button", { name: /Marcar todas como leídas/i });
    expect(markAllButton).toBeInTheDocument();
    fireEvent.click(markAllButton);
    expect(mockMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it("shows load more button when hasMore is true and calls loadMore on click", () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: "n1",
          organization: "org-1",
          actor: "u1",
          type: "DOC_UPLOADED",
          entity: { kind: "document", id: "d1" },
          message: "Test",
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

    const loadMoreButton = screen.getByRole("button", { name: /Cargar más/i });
    expect(loadMoreButton).toBeInTheDocument();

    fireEvent.click(loadMoreButton);
    expect(mockLoadMore).toHaveBeenCalledTimes(1);
  });  it("load more button is disabled while loading", () => {
    mockNotificationsState.mockReturnValue({
      notifications: [
        {
          id: "n1",
          organization: "org-1",
          actor: "u1",
          type: "DOC_UPLOADED",
          entity: { kind: "document", id: "d1" },
          message: "Test",
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      loading: true,
      hasMore: true,
      refresh: mockRefresh,
      loadMore: mockLoadMore,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    render(<Notifications />);

  });
});