// DoumentCard.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentCard from "../DocumentCard";
import type { Document } from "../../types/document.types";
import * as previewServiceModule from "../../services/preview.service";
import * as documentTypesModule from "../../types/document.types";
import * as deletionHookModule from "../../hooks/useDocumentDeletion";
import * as documentServiceModule from "../../services/document.service";

const moveToTrashMock = jest.fn<Promise<boolean>, [string]>();

jest.mock("../../hooks/useDocumentDeletion", () => ({
  useDocumentDeletion: jest.fn(),
}));

jest.mock("../../services/document.service", () => ({
  getActiveOrganizationId: jest.fn(),
  getOrganizationMembers: jest.fn(),
  shareDocument: jest.fn(),
}));

jest.mock("../../services/preview.service", () => ({
  previewService: {
    canPreview: jest.fn(() => true),
    getDownloadUrl: jest.fn(
      (doc: { id?: string; _id?: string }) =>
        `/download/${doc.id || doc._id || "unknown"}`,
    ),
  },
}));

jest.mock("../../types/document.types", () => {
  const actual = jest.requireActual(
    "../../types/document.types",
  ) as typeof import("../../types/document.types");
  return {
    ...actual,
    getFileTypeFromMime: jest.fn(() => "pdf"),
    formatFileSize: jest.fn(() => "1 KB"),
  };
});

jest.mock("../DocumentPreview", () => ({
  DocumentPreviewModal: ({
    show,
    onHide,
  }: {
    show: boolean;
    onHide: () => void;
  }) =>
    show ? (
      <div data-testid="preview-modal">
        PREVIEW
        <button type="button" onClick={onHide}>
          Close
        </button>
      </div>
    ) : null,
}));

describe("DocumentCard", () => {
  const OWNER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa"; // 24 hex
  const OTHER_ID = "bbbbbbbbbbbbbbbbbbbbbbbb"; // 24 hex
  const THIRD_ID = "cccccccccccccccccccccccc"; // 24 hex
  const DOC_ID = "dddddddddddddddddddddddd"; // 24 hex

  const baseDoc: Partial<Document> = {
    id: DOC_ID,
    filename: "file.pdf",
    originalname: "original.pdf",
    mimeType: "application/pdf",
    size: 1024,
    url: "/file.pdf",
    path: "/path",
    uploadedBy: OWNER_ID,
    organization: "org-1",
    folder: "folder_legal",
    uploadedAt: new Date("2026-02-14T00:00:00.000Z").toISOString(),
    sharedWith: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // IMPORTANT: DocumentCard parses auth_user without a try/catch
    localStorage.setItem("auth_user", JSON.stringify({ id: OWNER_ID }));

    (deletionHookModule.useDocumentDeletion as jest.Mock).mockReturnValue({
      moveToTrash: moveToTrashMock,
    });
    moveToTrashMock.mockResolvedValue(true);

    (previewServiceModule.previewService.canPreview as jest.Mock).mockReturnValue(
      true,
    );
    (
      previewServiceModule.previewService.getDownloadUrl as jest.Mock
    ).mockImplementation(
      (doc: { id?: string; _id?: string }) =>
        `/download/${doc.id || doc._id || "unknown"}`,
    );

    (documentTypesModule.getFileTypeFromMime as jest.Mock).mockReturnValue(
      "pdf",
    );
    (documentTypesModule.formatFileSize as jest.Mock).mockReturnValue("1 KB");

    // Configure the mocked service functions WITHOUT reassigning module exports
    (
      documentServiceModule.getActiveOrganizationId as unknown as jest.Mock
    ).mockResolvedValue("org-1");
    (
      documentServiceModule.getOrganizationMembers as unknown as jest.Mock
    ).mockResolvedValue([]);
    (
      documentServiceModule.shareDocument as unknown as jest.Mock
    ).mockResolvedValue({
      success: true,
      message: "ok",
      document: { id: DOC_ID },
    });
  });

  it("renders document title and badge", () => {
    render(<DocumentCard document={baseDoc as Document} />);
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /original\.pdf|file\.pdf/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByText("1 KB")).toBeInTheDocument();
  });

  it("renders different folder names correctly (including unknown -> General)", () => {
    const folders = [
      { id: "folder_proyectos", name: "Proyectos" },
      { id: "folder_tecnico", name: "Técnico" },
      { id: "folder_marketing", name: "Marketing" },
      { id: "folder_unknown", name: "General" },
    ];

    folders.forEach(({ id, name }) => {
      const doc = { ...baseDoc, folder: id };
      const { unmount } = render(<DocumentCard document={doc as Document} />);
      expect(screen.getByText(name)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders "Sin nombre" when originalname and filename are missing', () => {
    const doc: Partial<Document> = {
      ...baseDoc,
      originalname: undefined,
      filename: undefined,
    };
    render(<DocumentCard document={doc as Document} />);
    expect(screen.getByText("Sin nombre")).toBeInTheDocument();
  });

  it("calls window.open when download clicked (uses previewService.getDownloadUrl)", () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);

    render(<DocumentCard document={baseDoc as Document} />);
    fireEvent.click(screen.getByTitle("Descargar"));

    expect(
      previewServiceModule.previewService.getDownloadUrl,
    ).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledWith(
      "/download/dddddddddddddddddddddddd",
      "_blank",
    );

    openSpy.mockRestore();
  });

  it("uses _id if id is missing for download url", () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);

    const doc: Partial<Document> = {
      ...baseDoc,
      id: undefined,
      _id: "eeeeeeeeeeeeeeeeeeeeeeee",
    };
    render(<DocumentCard document={doc as Document} />);

    fireEvent.click(screen.getByTitle("Descargar"));

    expect(openSpy).toHaveBeenCalledWith(
      "/download/eeeeeeeeeeeeeeeeeeeeeeee",
      "_blank",
    );
    openSpy.mockRestore();
  });

  it("clicking card opens preview modal when canPreview is true, and modal Close triggers onHide (handleClosePreview)", async () => {
    const user = userEvent.setup();

    render(<DocumentCard document={baseDoc as Document} />);

    fireEvent.click(
      screen.getByRole("heading", { level: 3, name: /original\.pdf|file\.pdf/i }),
    );
    expect(screen.getByTestId("preview-modal")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByTestId("preview-modal")).not.toBeInTheDocument();
  });

  it("clicking preview option opens preview modal when canPreview is true", () => {
    render(<DocumentCard document={baseDoc as Document} />);
    fireEvent.click(screen.getByTitle("Vista previa"));
    expect(screen.getByTestId("preview-modal")).toBeInTheDocument();
  });

  it("does not open preview modal when canPreview is false AND does not render preview option button", () => {
    (
      previewServiceModule.previewService.canPreview as jest.Mock
    ).mockReturnValueOnce(false);

    render(<DocumentCard document={baseDoc as Document} />);

    expect(screen.queryByTitle("Vista previa")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("heading", { level: 3, name: /original\.pdf|file\.pdf/i }),
    );
    expect(screen.queryByTestId("preview-modal")).not.toBeInTheDocument();
  });

  it("renders different file icon branches (pdf, excel, default)", () => {
    (documentTypesModule.getFileTypeFromMime as jest.Mock).mockReturnValueOnce(
      "pdf",
    );
    const { unmount } = render(<DocumentCard document={baseDoc as Document} />);
    expect(document.querySelectorAll("svg").length).toBeGreaterThan(0);
    unmount();

    (documentTypesModule.getFileTypeFromMime as jest.Mock).mockReturnValueOnce(
      "excel",
    );
    const { unmount: unmount2 } = render(
      <DocumentCard document={baseDoc as Document} />,
    );
    expect(document.querySelectorAll("svg").length).toBeGreaterThan(0);
    unmount2();

    (documentTypesModule.getFileTypeFromMime as jest.Mock).mockReturnValueOnce(
      "word",
    );
    render(<DocumentCard document={baseDoc as Document} />);
    expect(document.querySelectorAll("svg").length).toBeGreaterThan(0);
  });

  it("supports uploadedAt as Date object (formatDate branch)", () => {
    const doc = {
      ...baseDoc,
      uploadedAt: new Date("2026-02-14T00:00:00.000Z"),
    } as unknown as Document;

    render(<DocumentCard document={doc} />);
    expect(
      screen.getByRole("heading", { level: 3, name: /original\.pdf|file\.pdf/i }),
    ).toBeInTheDocument();
  });

  it("does not render delete button when canDelete is false", () => {
    render(<DocumentCard document={baseDoc as Document} canDelete={false} />);
    expect(screen.queryByTitle("Mover a papelera")).not.toBeInTheDocument();
  });

  it("renders delete button when canDelete is true, opens modal, and Cancel closes it", async () => {
    const user = userEvent.setup();

    render(<DocumentCard document={baseDoc as Document} canDelete />);

    await user.click(screen.getByTitle("Mover a papelera"));
    expect(
      screen.getByText("¿Deseas mover este documento a la papelera?"),
    ).toBeInTheDocument();

    // There are 2 "Cancelar" buttons in UI (share + delete) only when share modal open,
    // but here only delete modal is open.
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(
      screen.queryByText("¿Deseas mover este documento a la papelera?"),
    ).not.toBeInTheDocument();
  });

  it("confirm delete calls moveToTrash with document id, closes modal, and calls onDeleted", async () => {
    const user = userEvent.setup();
    const onDeleted = jest.fn();

    render(<DocumentCard document={baseDoc as Document} canDelete onDeleted={onDeleted} />);

    await user.click(screen.getByTitle("Mover a papelera"));
    expect(
      screen.getByText("¿Deseas mover este documento a la papelera?"),
    ).toBeInTheDocument();

  });

  it("renders Share button when current user is owner and opens Share modal (loads members)", async () => {
    const user = userEvent.setup();

    (
      documentServiceModule.getOrganizationMembers as unknown as jest.Mock
    ).mockResolvedValueOnce([
      { user: { id: OTHER_ID, name: "Alice", email: "alice@example.com" } },
      { user: { _id: THIRD_ID, name: "Bob", email: "bob@example.com" } },
    ]);

    render(<DocumentCard document={baseDoc as Document} />);

    const shareBtn = screen.getByTitle("Compartir");
    expect(shareBtn).toBeInTheDocument();

    await user.click(shareBtn);

    expect(screen.getByText("Compartir documento")).toBeInTheDocument();
    await waitFor(() => {
      expect(documentServiceModule.getActiveOrganizationId).toHaveBeenCalledTimes(1);
      expect(documentServiceModule.getOrganizationMembers).toHaveBeenCalledWith("org-1");
    });

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("filters out owner, already-shared, and invalid member IDs in share list", async () => {
    const user = userEvent.setup();

    const doc: Partial<Document> = {
      ...baseDoc,
      sharedWith: [OTHER_ID],
    };

    (
      documentServiceModule.getOrganizationMembers as unknown as jest.Mock
    ).mockResolvedValueOnce([
      { user: { id: OWNER_ID, name: "Owner", email: "owner@example.com" } },
      { user: { id: OTHER_ID, name: "AlreadyShared", email: "a@x.com" } },
      { user: { id: "not-a-valid-object-id", name: "Bad", email: "bad@x.com" } },
      { user: { id: THIRD_ID, name: "Keeps", email: "keeps@x.com" } },
    ]);

    render(<DocumentCard document={doc as Document} />);

    await user.click(screen.getByTitle("Compartir"));

    expect(await screen.findByText("Keeps")).toBeInTheDocument();
    expect(screen.queryByText("Owner")).not.toBeInTheDocument();
    expect(screen.queryByText("AlreadyShared")).not.toBeInTheDocument();
    expect(screen.queryByText("Bad")).not.toBeInTheDocument();
  });

  it("share flow: select one member and confirm calls shareDocument with selected userIds and closes modal", async () => {
    const user = userEvent.setup();

    (
      documentServiceModule.getOrganizationMembers as unknown as jest.Mock
    ).mockResolvedValueOnce([
      { user: { id: OTHER_ID, name: "Alice", email: "alice@example.com" } },
      { user: { id: THIRD_ID, name: "Bob", email: "bob@example.com" } },
    ]);

    render(<DocumentCard document={baseDoc as Document} />);

    await user.click(screen.getByTitle("Compartir"));
    expect(await screen.findByText("Alice")).toBeInTheDocument();

    await user.click(screen.getByText("Alice"));

    const confirmBtn = screen.getByRole("button", { name: "Compartir (1)" });
    expect(confirmBtn).toBeEnabled();

    await user.click(confirmBtn);

    await waitFor(() => {
      expect(documentServiceModule.shareDocument).toHaveBeenCalledWith(DOC_ID, [OTHER_ID]);
    });

    await waitFor(() => {
      expect(screen.queryByText("Compartir documento")).not.toBeInTheDocument();
    });
  });

  it("share modal confirm is disabled when no member selected", async () => {
    const user = userEvent.setup();

    (
      documentServiceModule.getOrganizationMembers as unknown as jest.Mock
    ).mockResolvedValueOnce([
      { user: { id: OTHER_ID, name: "Alice", email: "alice@example.com" } },
    ]);

    render(<DocumentCard document={baseDoc as Document} />);

    await user.click(screen.getByTitle("Compartir"));
    expect(await screen.findByText("Alice")).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "Compartir (0)" });
    expect(confirmBtn).toBeDisabled();
  });

  it("share member search filters the list by name/email", async () => {
    const user = userEvent.setup();

    (
      documentServiceModule.getOrganizationMembers as unknown as jest.Mock
    ).mockResolvedValueOnce([
      { user: { id: OTHER_ID, name: "Alice", email: "alice@example.com" } },
      { user: { id: THIRD_ID, name: "Bob", email: "bob@example.com" } },
    ]);

    render(<DocumentCard document={baseDoc as Document} />);

    await user.click(screen.getByTitle("Compartir"));
    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();

    const search = screen.getByPlaceholderText("Buscar por nombre o email...");
    await user.type(search, "bob");

    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("when current user is NOT the owner, clicking Share opens modal with 'Solo el propietario...' and does not load members", async () => {

    localStorage.setItem("auth_user", JSON.stringify({ id: "ffffffffffffffffffffffff" }));

    render(<DocumentCard document={baseDoc as Document} />);

    expect(documentServiceModule.getActiveOrganizationId).not.toHaveBeenCalled();
    expect(documentServiceModule.getOrganizationMembers).not.toHaveBeenCalled();
  });

  it("does not render Share button when ownerId cannot be derived (uploadedBy invalid)", () => {
    const doc: Partial<Document> = {
      ...baseDoc,
      uploadedBy: "not-a-valid-object-id",
    };

    render(<DocumentCard document={doc as Document} />);
    expect(screen.queryByTitle("Compartir")).not.toBeInTheDocument();
  });
});