import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import type { Document } from "../../types/document.types";
import Header from "../Header";

const mockNavigate = jest.fn<void, [string]>();
const mockLogout = jest.fn<Promise<void>, []>();

const mockUseLocation = jest.fn<{ pathname: string }, []>();
const mockUseAuth = jest.fn<
  {
    logout: () => Promise<void>;
    user: { id: string; name?: string; email?: string } | null;
  },
  []
>();

type NotificationEntity = { kind?: string; id?: string };
type NotificationItem = {
  id?: string;
  type: string;
  createdAt?: string;
  actor?: string;
  message?: string;
  readAt?: string | null;
  entity?: NotificationEntity;
};

const mockRefresh = jest.fn<Promise<void>, []>();
const mockMarkRead = jest.fn<Promise<void>, [string]>();
const mockMarkAllRead = jest.fn<Promise<void>, []>();

const mockUseNotifications = jest.fn<
  {
    notifications: NotificationItem[];
    unreadCount: number;
    loading: boolean;
    refresh: () => Promise<void>;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
  },
  []
>();

type OrganizationRole = "owner" | "admin" | "member" | "viewer";
type MockMembership = { role?: OrganizationRole };
type MockActiveOrg = { role?: OrganizationRole; id?: string };

const mockUseOrganization = jest.fn<
  { activeOrganization?: MockActiveOrg; membership?: MockMembership },
  []
>();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

jest.mock("../../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../../hooks/useNotifications", () => ({
  useNotifications: () => mockUseNotifications(),
}));

jest.mock("../../hooks/useOrganization", () => ({
  __esModule: true,
  default: () => mockUseOrganization(),
}));

jest.mock("../Organization/OrganizationSelector", () => () => (
  <div>OrgSel</div>
));

interface FileUploaderProps {
  onUploadSuccess?: (docs: Document[]) => void;
  onClose?: () => void;
}

jest.mock("../FileUploader", () => ({
  FileUploader: ({ onUploadSuccess, onClose }: FileUploaderProps) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onUploadSuccess &&
          onUploadSuccess([{ id: "d1" } as unknown as Document])
        }
      >
        mockUpload
      </button>
      <button type="button" onClick={() => onClose && onClose()}>
        mockClose
      </button>
    </div>
  ),
}));

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseLocation.mockReturnValue({ pathname: "/" });

    mockLogout.mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      logout: mockLogout,
      user: { id: "u1", name: "Pedro", email: "p@p.com" },
    });

    mockRefresh.mockResolvedValue(undefined);
    mockMarkRead.mockResolvedValue(undefined);
    mockMarkAllRead.mockResolvedValue(undefined);

    mockUseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      refresh: mockRefresh,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    // Default role allows upload (member)
    mockUseOrganization.mockReturnValue({
      activeOrganization: { role: "member", id: "org1" },
      membership: { role: "member" },
    });
  });

  it("renders user info and main buttons (including upload when canUpload)", () => {
    render(<Header />);

    expect(screen.getByText("Pedro")).toBeInTheDocument();
    expect(screen.getByText("P")).toBeInTheDocument();
    expect(screen.getByText("Subir")).toBeInTheDocument();
    expect(screen.getByText("Salir")).toBeInTheDocument();
    expect(screen.getByText("OrgSel")).toBeInTheDocument();
  });

  it("hides upload button and modal for viewer role (canUpload false branch)", () => {
    mockUseOrganization.mockReturnValueOnce({
      activeOrganization: { role: "viewer", id: "org1" },
      membership: { role: "viewer" },
    });

    render(<Header />);

    expect(screen.queryByText("Subir")).not.toBeInTheDocument();
    // Modal content should not exist either
    expect(screen.queryByText("mockUpload")).not.toBeInTheDocument();
  });

  it("navigates to /login on logout (even when logout succeeds)", async () => {
    render(<Header />);

    fireEvent.click(screen.getByRole("button", { name: /Salir/i }));

    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("opens upload modal and handles upload success (calls onDocumentsUploaded and closes modal)", async () => {
    const onDocs = jest.fn<void, [Document[]]>();

    render(<Header onDocumentsUploaded={onDocs} />);

    fireEvent.click(screen.getByRole("button", { name: /Subir/i }));

    const mockUploadBtn = await screen.findByText("mockUpload");
    fireEvent.click(mockUploadBtn);

    await waitFor(() => expect(onDocs).toHaveBeenCalledTimes(1));
    expect(onDocs).toHaveBeenCalledWith([{ id: "d1" } as unknown as Document]);

    // modal closed (uploader content gone)
    await waitFor(() =>
      expect(screen.queryByText("mockUpload")).not.toBeInTheDocument(),
    );
  });

  it("closes upload modal when mockClose is clicked", async () => {
    render(<Header />);

    fireEvent.click(screen.getByRole("button", { name: /Subir/i }));

    const mockCloseBtn = await screen.findByText("mockClose");
    fireEvent.click(mockCloseBtn);

    await waitFor(() =>
      expect(screen.queryByText("mockUpload")).not.toBeInTheDocument(),
    );
  });

  it("renders Dashboard button when user exists and not on /dashboard, and navigates when clicked", () => {
    mockUseLocation.mockReturnValueOnce({ pathname: "/" });

    render(<Header />);

    const dashboardBtn = screen.getByTitle("Dashboard");
    fireEvent.click(dashboardBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("does NOT render Dashboard button when already on /dashboard (branch)", () => {
    mockUseLocation.mockReturnValueOnce({ pathname: "/dashboard" });

    render(<Header />);

    expect(screen.queryByTitle("Dashboard")).not.toBeInTheDocument();
  });

  it("clicking user badge navigates to /profile", () => {
    render(<Header />);

    fireEvent.click(screen.getByText("Pedro"));
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  it("uses email for avatar letter and display name when name missing (branches)", () => {
    mockUseAuth.mockReturnValueOnce({
      logout: mockLogout,
      user: { id: "u1", name: undefined, email: "mario@kawi.com" },
    });

    render(<Header />);

    expect(screen.getByText("mario@kawi.com")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("uses defaults when user missing (branches)", () => {
    mockUseAuth.mockReturnValueOnce({
      logout: mockLogout,
      user: null,
    });

    render(<Header />);

    // Default avatar + display name
    expect(screen.getByText("U")).toBeInTheDocument();
    expect(screen.getByText("Usuario")).toBeInTheDocument();

    // Dashboard button should not render without user
    expect(screen.queryByTitle("Dashboard")).not.toBeInTheDocument();
  });

  it("opens notifications popover and refresh is called when opening (onToggle branch)", async () => {
    render(<Header />);

    fireEvent.click(screen.getByTitle("Notificaciones"));

    await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Notificaciones")).toBeInTheDocument();
  });

  it("renders loading state inside notifications popover (notifLoading branch)", async () => {
    mockUseNotifications.mockReturnValueOnce({
      notifications: [],
      unreadCount: 0,
      loading: true,
      refresh: mockRefresh,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    render(<Header />);

    fireEvent.click(screen.getByTitle("Notificaciones"));

    expect(await screen.findByText("Cargando...")).toBeInTheDocument();
  });

  it("renders empty state when no notifications and not loading (branch)", async () => {
    render(<Header />);

    fireEvent.click(screen.getByTitle("Notificaciones"));

    expect(
      await screen.findByText("No tienes notificaciones."),
    ).toBeInTheDocument();
  });

  it("renders notification list, type labels, unread badge, createdAt, and markRead only when id exists (branches)", async () => {
    const nowIso = new Date("2026-02-15T12:00:00.000Z").toISOString();

    const notifications: NotificationItem[] = [
      {
        id: "n1",
        type: "DOC_UPLOADED",
        message: "Se subió un documento",
        createdAt: nowIso,
        readAt: null,
        actor: "u1",
        entity: { kind: "document", id: "d1" },
      },
      {
        // no id -> should NOT call markRead
        type: "SOMETHING_ELSE",
        message: "",
        createdAt: nowIso,
        readAt: nowIso,
        actor: "u2",
      },
      {
        id: "n3",
        type: "DOC_EDITED",
        message: "Documento actualizado",
        createdAt: nowIso,
        readAt: null,
        actor: "u3",
      },
      {
        id: "n4",
        type: "DOC_COMMENTED",
        message: "Nuevo comentario",
        createdAt: nowIso,
        readAt: null,
        actor: "u4",
      },
    ];

    mockUseNotifications.mockReturnValueOnce({
      notifications,
      unreadCount: 0,
      loading: false,
      refresh: mockRefresh,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    render(<Header />);

    fireEvent.click(screen.getByTitle("Notificaciones"));

    // Popover visible
    expect(await screen.findByText("Notificaciones")).toBeInTheDocument();

    // Type labels
    expect(screen.getByText("Documento subido")).toBeInTheDocument();

    // Unread badge "Nuevo" appears for unread items
    expect(screen.getAllByText("Nuevo").length).toBeGreaterThan(0);

    // createdAt rendered (string varies by locale; just assert something from Date is present)
    const maybeDate = screen.getAllByText((t) => t.includes("2026"));
    expect(maybeDate.length).toBeGreaterThan(0);

    // Click first item -> markRead called (has id)
    fireEvent.click(screen.getByText("Se subió un documento"));
    await waitFor(() => expect(mockMarkRead).toHaveBeenCalledWith("n1"));

    // Click second item -> no id, should not call markRead again
    fireEvent.click(screen.getByText("Tienes una notificación"));
    expect(mockMarkRead).toHaveBeenCalledTimes(1);
  });

  it('clicking "Marcar todas como leídas" calls markAllRead (and does not throw on rejection)', async () => {
    mockMarkAllRead.mockRejectedValueOnce(new Error("fail"));

    render(<Header />);

    fireEvent.click(screen.getByTitle("Notificaciones"));
    expect(await screen.findByText("Notificaciones")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Marcar todas como leídas" }),
    );

    await waitFor(() => expect(mockMarkAllRead).toHaveBeenCalledTimes(1));
  });

  it("shows unread badge with exact count and with 99+ when > 99 (branches)", () => {
    mockUseNotifications.mockReturnValueOnce({
      notifications: [],
      unreadCount: 5,
      loading: false,
      refresh: mockRefresh,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    const { rerender } = render(<Header />);

    expect(
      screen.getByLabelText("5 notificaciones no leídas"),
    ).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    mockUseNotifications.mockReturnValueOnce({
      notifications: [],
      unreadCount: 120,
      loading: false,
      refresh: mockRefresh,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
    });

    rerender(<Header />);

    expect(
      screen.getByLabelText("120 notificaciones no leídas"),
    ).toBeInTheDocument();
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("treats role case-insensitively: VIEWER hides upload (branch)", () => {
    mockUseOrganization.mockReturnValueOnce({
      activeOrganization: { role: "member", id: "org1" },
      membership: { role: "viewer" },
    });

    render(<Header />);

    expect(screen.queryByText("Subir")).not.toBeInTheDocument();
  });

  it("uses activeOrganization.role when membership.role missing (branch)", () => {
    mockUseOrganization.mockReturnValueOnce({
      activeOrganization: { role: "viewer", id: "org1" },
      membership: {},
    });

    render(<Header />);

    expect(screen.queryByText("Subir")).not.toBeInTheDocument();
  });
});
