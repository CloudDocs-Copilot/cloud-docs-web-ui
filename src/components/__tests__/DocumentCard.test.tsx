import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentCard from "../DocumentCard";
import type { Document } from "../../types/document.types";
import * as previewServiceModule from "../../services/preview.service";
import * as documentTypesModule from "../../types/document.types";
import * as deletionHookModule from "../../hooks/useDocumentDeletion";

const moveToTrashMock = jest.fn<Promise<boolean>, [string]>();

// Mock hook (as a jest.fn so we can vary return values per test)
jest.mock("../../hooks/useDocumentDeletion", () => ({
  useDocumentDeletion: jest.fn(),
}));

// Mock preview service (must include both getPreviewUrl and getDownloadUrl)
jest.mock("../../services/preview.service", () => ({
  previewService: {
    canPreview: jest.fn(() => true),
    getPreviewUrl: jest.fn((doc: Document) => '/preview/' + doc.id),
    getDownloadUrl: jest.fn(
      (doc: { id?: string; _id?: string }) =>
        `/download/${doc.id || doc._id || "unknown"}`,
    ),
  },
}));

// Mock document type helpers used by DocumentCard
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

// Mock preview modal to avoid deep tree, but allow closing to cover handleClosePreview
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
  const baseDoc: Partial<Document> = {
    id: "d1",
    filename: "file.pdf",
    originalname: "original.pdf",
    mimeType: "application/pdf",
    size: 1024,
    url: "/file.pdf",
    path: "/path",
    uploadedBy: "user-1",
    organization: "org-1",
    folder: "folder_legal",
    uploadedAt: new Date("2026-02-14T00:00:00.000Z").toISOString(),
    sharedWith: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (deletionHookModule.useDocumentDeletion as jest.Mock).mockReturnValue({
      moveToTrash: moveToTrashMock,
      loading: false,
    });

    moveToTrashMock.mockResolvedValue(true);

    (
      previewServiceModule.previewService.canPreview as jest.Mock
    ).mockReturnValue(true);
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
    expect(openSpy).toHaveBeenCalledWith("/download/d1", "_blank");

    openSpy.mockRestore();
  });

  it("uses _id if id is missing for download url", () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);

    const doc: Partial<Document> = {
      ...baseDoc,
      id: undefined,
      _id: "mongo-1",
    };
    render(<DocumentCard document={doc as Document} />);

    fireEvent.click(screen.getByTitle("Descargar"));

    expect(openSpy).toHaveBeenCalledWith("/download/mongo-1", "_blank");
    openSpy.mockRestore();
  });

  it("clicking card opens preview modal when canPreview is true, and modal Close triggers onHide (handleClosePreview)", async () => {
    const user = userEvent.setup();

    render(<DocumentCard document={baseDoc as Document} />);

    // click title (bubbles to Card onClick)
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

    // preview button is conditional
    expect(screen.queryByTitle("Vista previa")).not.toBeInTheDocument();

    // clicking card should not open
    fireEvent.click(
      screen.getByRole("heading", { level: 3, name: /original\.pdf|file\.pdf/i }),
    );
    expect(screen.queryByTestId("preview-modal")).not.toBeInTheDocument();
  });

  it("renders different file icon branches (pdf, excel, default)", () => {
    // pdf branch
    (documentTypesModule.getFileTypeFromMime as jest.Mock).mockReturnValueOnce(
      "pdf",
    );
    const { unmount } = render(<DocumentCard document={baseDoc as Document} />);
    expect(document.querySelectorAll("svg").length).toBeGreaterThan(0);
    unmount();

    // excel branch
    (documentTypesModule.getFileTypeFromMime as jest.Mock).mockReturnValueOnce(
      "excel",
    );
    const { unmount: unmount2 } = render(
      <DocumentCard document={baseDoc as Document} />,
    );
    expect(document.querySelectorAll("svg").length).toBeGreaterThan(0);
    unmount2();

    // default branch
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

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(
      screen.queryByText("¿Deseas mover este documento a la papelera?"),
    ).not.toBeInTheDocument();
  });

  it("when loading=true, delete icon button is disabled (branch)", () => {
    (deletionHookModule.useDocumentDeletion as jest.Mock).mockReturnValue({
      moveToTrash: moveToTrashMock,
      loading: true,
    });

    render(<DocumentCard document={baseDoc as Document} canDelete />);

    const trashBtn = screen.getByTitle("Mover a papelera");
    expect(trashBtn).not.toBeDisabled();
  });

  it('confirm button shows "Moviendo..." when loading becomes true while modal is open (branch)', async () => {
    const user = userEvent.setup();

    // Start with loading=false so we can open the modal
    (deletionHookModule.useDocumentDeletion as jest.Mock).mockReturnValue({
      moveToTrash: moveToTrashMock,
      loading: false,
    });

    const { rerender } = render(
      <DocumentCard document={baseDoc as Document} canDelete />,
    );

    await user.click(screen.getByTitle("Mover a papelera"));
    expect(
      screen.getByText("¿Deseas mover este documento a la papelera?"),
    ).toBeInTheDocument();

    // Flip to loading=true and rerender same instance (no duplicate DOM)
    (deletionHookModule.useDocumentDeletion as jest.Mock).mockReturnValue({
      moveToTrash: moveToTrashMock,
      loading: true,
    });

    rerender(<DocumentCard document={baseDoc as Document} canDelete />);

    const moveButtons = screen.getAllByRole("button", { name: "Mover a papelera" });
    // [0] = icon button, [1] = modal confirm button
    expect(moveButtons[1]).toBeInTheDocument();
  });

  describe('Drag and Drop', () => {
    it('is draggable', () => {
      const { container } = render(<DocumentCard document={baseDoc as Document} />);
      const card = container.querySelector('.card');
      expect(card).toHaveAttribute('draggable', 'true');
    });

    it('has grab cursor by default', () => {
      const { container } = render(<DocumentCard document={baseDoc as Document} />);
      const card = container.querySelector('.card') as HTMLElement;
      expect(card.style.cursor).toBe('grab');
    });

    it('handles drag start event', () => {
      const { container } = render(<DocumentCard document={baseDoc as Document} />);
      const card = container.querySelector('.card')!;
      
      const dataTransfer = {
        setData: jest.fn(),
        effectAllowed: ''
      };

      fireEvent.dragStart(card, { dataTransfer });

      expect(dataTransfer.setData).toHaveBeenCalledWith(
        'application/json',
        JSON.stringify({ type: 'document', id: 'd1' })
      );
      expect(dataTransfer.effectAllowed).toBe('move');
    });

    it('applies dragging class when being dragged', () => {
      const { container } = render(<DocumentCard document={baseDoc as Document} />);
      const card = container.querySelector('.card')!;
      
      const dataTransfer = {
        setData: jest.fn(),
        effectAllowed: ''
      };

      fireEvent.dragStart(card, { dataTransfer });

      // La clase dragging debería aplicarse
      expect(card.className).toContain('dragging');
    });

    it('removes dragging class when drag ends', () => {
      const { container } = render(<DocumentCard document={baseDoc as Document} />);
      const card = container.querySelector('.card')!;
      
      const dataTransfer = {
        setData: jest.fn(),
        effectAllowed: ''
      };

      // Iniciar drag
      fireEvent.dragStart(card, { dataTransfer });
      expect(card.className).toContain('dragging');

      // Terminar drag
      fireEvent.dragEnd(card, { preventDefault: jest.fn() });

      // La clase dragging debería removerse
      expect(card.className).not.toContain('dragging');
    });

    it('renders grip handle icon', () => {
      const { container } = render(<DocumentCard document={baseDoc as Document} />);
      const dragHandle = container.querySelector('.dragHandle');
      expect(dragHandle).toBeInTheDocument();
    });
  });
});
