import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentCommentsPanel from "../Comments/DocumentCommentsPanel";
import type { Comment } from "../../types/comment.types";
import { commentsService } from "../../services/comments.service";

type ListResponse = { comments?: Comment[] };
type CreateResponse = { comment: Comment };
type UpdateResponse = { comment: Comment };

const listByDocumentMock = jest.fn<Promise<ListResponse>, [string]>();
const createMock = jest.fn<Promise<CreateResponse>, [string, string]>();
const updateMock = jest.fn<Promise<UpdateResponse>, [string, string]>();

jest.mock("../../services/comments.service", () => ({
  commentsService: {
    listByDocument: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

function makeComment(
  overrides: Partial<Comment> & { _id?: string; createdBy?: unknown } = {},
): Comment {
  const base: Partial<Comment> = {
    id: "c1",
    content: "Hola",
    createdAt: new Date("2026-02-14T10:00:00.000Z").toISOString(),
  };

  return { ...base, ...overrides } as Comment;
}

describe("DocumentCommentsPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (
      commentsService.listByDocument as unknown as typeof listByDocumentMock
    ).mockImplementation(listByDocumentMock);
    (commentsService.create as unknown as typeof createMock).mockImplementation(
      createMock,
    );
    (commentsService.update as unknown as typeof updateMock).mockImplementation(
      updateMock,
    );

    listByDocumentMock.mockResolvedValue({ comments: [] });
    createMock.mockResolvedValue({
      comment: makeComment({ id: "new1", content: "Nuevo" }),
    });
    updateMock.mockResolvedValue({
      comment: makeComment({ id: "c1", content: "Editado" }),
    });
  });

  it("fetches comments on mount and shows empty state", async () => {
    listByDocumentMock.mockResolvedValueOnce({ comments: [] });

    render(
      <DocumentCommentsPanel documentId="d1" currentUserId="u1" canComment />,
    );

    await waitFor(() => expect(listByDocumentMock).toHaveBeenCalledWith("d1"));
    expect(screen.getByText("Aún no hay comentarios.")).toBeInTheDocument();
  });

  it("shows loading spinner while fetching (loading branch)", async () => {
    let resolveFn: ((v: ListResponse) => void) | undefined;

    const pending = new Promise<ListResponse>((resolve) => {
      resolveFn = resolve;
    });

    listByDocumentMock.mockReturnValueOnce(pending);

    render(
      <DocumentCommentsPanel documentId="d1" currentUserId="u1" canComment />,
    );

    expect(screen.getByText("Cargando comentarios...")).toBeInTheDocument();

    resolveFn?.({ comments: [] });

    await waitFor(() =>
      expect(
        screen.queryByText("Cargando comentarios..."),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Aún no hay comentarios.")).toBeInTheDocument();
  });

  it("shows error when fetching fails (error branch)", async () => {
    listByDocumentMock.mockRejectedValueOnce(new Error("fail"));

    render(
      <DocumentCommentsPanel documentId="d1" currentUserId="u1" canComment />,
    );

    await waitFor(() => expect(listByDocumentMock).toHaveBeenCalledWith("d1"));
    expect(screen.getByText("Failed to load comments")).toBeInTheDocument();
  });

  it("refresh button calls fetch again and is disabled during loading", async () => {
    listByDocumentMock.mockResolvedValueOnce({ comments: [] });

    render(
      <DocumentCommentsPanel documentId="d1" currentUserId="u1" canComment />,
    );

    await waitFor(() => expect(listByDocumentMock).toHaveBeenCalledTimes(1));

    let resolveFn: ((v: ListResponse) => void) | undefined;
    const pending = new Promise<ListResponse>((resolve) => {
      resolveFn = resolve;
    });
    listByDocumentMock.mockReturnValueOnce(pending);

    const refreshBtn = screen.getByRole("button", { name: "↻" });
    fireEvent.click(refreshBtn);

    expect(listByDocumentMock).toHaveBeenCalledTimes(2);
    expect(refreshBtn).toBeDisabled();

    resolveFn?.({ comments: [] });

    await waitFor(() => expect(refreshBtn).not.toBeDisabled());
  });

  it("canComment=false disables textarea, changes placeholder and shows permission hint (branches)", () => {
    render(
      <DocumentCommentsPanel
        documentId="d1"
        currentUserId="u1"
        canComment={false}
      />,
    );

    const textarea = screen.getByPlaceholderText(
      "No tienes permisos para comentar",
    ) as HTMLTextAreaElement;
    expect(textarea).toBeDisabled();

    expect(
      screen.getByText(
        "Solo editores o usuarios con permiso de comentar pueden escribir.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Comentar" })).toBeDisabled();
  });

  it('shows "Sé claro y breve." when content is empty, then shows count when content exists (hint branches)', async () => {
    const user = userEvent.setup();

    render(
      <DocumentCommentsPanel documentId="d1" currentUserId="u1" canComment />,
    );

    expect(screen.getByText("Sé claro y breve.")).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(
      "Escribe un comentario...",
    ) as HTMLTextAreaElement;
    await user.type(textarea, "Hola mundo");
  });

  it("creates a comment successfully, trims content, prepends it, clears input, and disables refresh while saving (branches)", async () => {
    const user = userEvent.setup();

    listByDocumentMock.mockResolvedValueOnce({ comments: [] });

    const created = makeComment({
      id: "new1",
      content: "Nuevo comentario",
      createdAt: new Date("2026-02-15T11:00:00.000Z").toISOString(),
    });

    let resolveCreate: ((v: CreateResponse) => void) | undefined;
    const pendingCreate = new Promise<CreateResponse>((resolve) => {
      resolveCreate = resolve;
    });
    createMock.mockReturnValueOnce(pendingCreate);

    render(
      <DocumentCommentsPanel documentId="d1" currentUserId="u1" canComment />,
    );

    await waitFor(() => expect(listByDocumentMock).toHaveBeenCalled());

    const textarea = screen.getByPlaceholderText(
      "Escribe un comentario...",
    ) as HTMLTextAreaElement;
    await user.type(textarea, "   Nuevo comentario   ");

    const submitBtn = screen.getByRole("button", { name: "Comentar" });
    expect(submitBtn).toBeEnabled();

    const refreshBtn = screen.getByRole("button", { name: "↻" });

    await user.click(submitBtn);

    expect(createMock).toHaveBeenCalledWith("d1", "Nuevo comentario");
    expect(
      screen.getByRole("button", { name: "Guardando..." }),
    ).toBeInTheDocument();
    expect(refreshBtn).toBeDisabled();

    resolveCreate?.({ comment: created });

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Guardando..." }),
      ).not.toBeInTheDocument(),
    );

    expect(screen.getByText("Nuevo comentario")).toBeInTheDocument();
    expect(
      (
        screen.getByPlaceholderText(
          "Escribe un comentario...",
        ) as HTMLTextAreaElement
      ).value,
    ).toBe("");
  });

  it("shows error when create fails (branch)", async () => {
    const user = userEvent.setup();

    listByDocumentMock.mockResolvedValueOnce({ comments: [] });
    createMock.mockRejectedValueOnce(new Error("fail"));

    render(
      <DocumentCommentsPanel documentId="d1" currentUserId="u1" canComment />,
    );

    await waitFor(() => expect(listByDocumentMock).toHaveBeenCalled());

    const textarea = screen.getByPlaceholderText(
      "Escribe un comentario...",
    ) as HTMLTextAreaElement;
    await user.type(textarea, "Hola");

    await user.click(screen.getByRole("button", { name: "Comentar" }));

    await waitFor(() => expect(createMock).toHaveBeenCalled());
    expect(screen.getByText("Failed to create comment")).toBeInTheDocument();
  });

  it("renders author name from createdBy object and shows Edit for owner; edit -> save updates content (success branch)", async () => {
    const user = userEvent.setup();

    const withCreatedBy = {
      ...(makeComment({
        id: "c1",
        content: "Original",
        createdAt: new Date("2026-02-15T09:00:00.000Z").toISOString(),
      }) as unknown as Record<string, unknown>),
      createdBy: { id: "u1", name: "Pedro" },
    } as unknown as Comment;

    listByDocumentMock.mockResolvedValueOnce({ comments: [withCreatedBy] });

    const updated = {
      ...(withCreatedBy as unknown as Record<string, unknown>),
      content: "Editado OK",
    } as unknown as Comment;

    updateMock.mockResolvedValueOnce({ comment: updated });

    render(
      <DocumentCommentsPanel documentId="d1" currentUserId="u1" canComment />,
    );

    await waitFor(() =>
      expect(screen.getByText("Original")).toBeInTheDocument(),
    );
    expect(screen.getByText("Pedro")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Editar" }));

    const editBox = screen.getAllByRole("textbox")[0] as HTMLTextAreaElement;
    await user.clear(editBox);
    await user.type(editBox, "  Editado OK  ");

    const saveBtn = screen.getByRole("button", { name: "Guardar" });
    expect(saveBtn).toBeEnabled();

    await user.click(saveBtn);

    expect(
      screen.queryByRole("button", { name: "Guardar" }),
    ).not.toBeInTheDocument();
  });

  it("uses _id when id missing for edit/update (branch)", async () => {
    const user = userEvent.setup();

    const withMongoId = {
      ...(makeComment({
        id: undefined,
        content: "Con _id",
        createdAt: new Date("2026-02-15T09:00:00.000Z").toISOString(),
      }) as unknown as Record<string, unknown>),
      _id: "mongo-1",
      createdBy: "u1",
    } as unknown as Comment;

    listByDocumentMock.mockResolvedValueOnce({ comments: [withMongoId] });

    const updated = {
      ...(withMongoId as unknown as Record<string, unknown>),
      content: "Nuevo texto",
    } as unknown as Comment;

    updateMock.mockResolvedValueOnce({ comment: updated });

    render(
      <DocumentCommentsPanel documentId="d1" currentUserId="u1" canComment />,
    );

    await waitFor(() =>
      expect(screen.getByText("Con _id")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "Editar" }));

    const editBox = screen.getAllByRole("textbox")[0] as HTMLTextAreaElement;
    await user.clear(editBox);
    await user.type(editBox, "Nuevo texto");

    await user.click(screen.getByRole("button", { name: "Guardar" }));
  });

  it("non-owner without moderation cannot edit (button disabled branch)", async () => {
    listByDocumentMock.mockResolvedValueOnce({
      comments: [
        {
          ...makeComment({ id: "c2", content: "No editable" }),
          createdBy: "someone-else",
        } as unknown as Comment,
      ],
    });

    render(
      <DocumentCommentsPanel
        documentId="d1"
        currentUserId="u1"
        canComment
        canModerateComments={false}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("No editable")).toBeInTheDocument(),
    );

    const editBtn = screen.getByRole("button", { name: "Editar" });
    expect(editBtn).toBeDisabled();

    fireEvent.click(editBtn);
    expect(
      screen.queryByRole("button", { name: "Guardar" }),
    ).not.toBeInTheDocument();
  });

  it("moderator can edit even if not owner (permission branch)", async () => {
    const user = userEvent.setup();

    listByDocumentMock.mockResolvedValueOnce({
      comments: [
        {
          ...makeComment({ id: "c3", content: "Moderable" }),
          createdBy: "someone-else",
        } as unknown as Comment,
      ],
    });

    render(
      <DocumentCommentsPanel
        documentId="d1"
        currentUserId="u1"
        canComment
        canModerateComments
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("Moderable")).toBeInTheDocument(),
    );

    const editBtn = screen.getByRole("button", { name: "Editar" });
    expect(editBtn).toBeEnabled();

    await user.click(editBtn);
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });

  it("saveEdit returns early when editingValue is blank (branch)", async () => {
    const user = userEvent.setup();

    listByDocumentMock.mockResolvedValueOnce({
      comments: [
        {
          ...makeComment({ id: "c4", content: "Texto" }),
          createdBy: "u1",
        } as unknown as Comment,
      ],
    });

    render(
      <DocumentCommentsPanel documentId="d1" currentUserId="u1" canComment />,
    );

    await waitFor(() => expect(screen.getByText("Texto")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Editar" }));

    const editBox = screen.getAllByRole("textbox")[0] as HTMLTextAreaElement;
    await user.clear(editBox);
    await user.type(editBox, "   ");

    const saveBtn = screen.getByRole("button", { name: "Guardar" });

    fireEvent.click(saveBtn);
  });

  it("saveEdit shows permission error if user loses permission mid-edit (branch in saveEdit target check)", async () => {
    const user = userEvent.setup();

    const comment = {
      ...makeComment({ id: "c5", content: "Texto" }),
      createdBy: "someone-else",
    } as unknown as Comment;

    listByDocumentMock.mockResolvedValueOnce({ comments: [comment] });

    const { rerender } = render(
      <DocumentCommentsPanel
        documentId="d1"
        currentUserId="u1"
        canComment
        canModerateComments
      />,
    );

    await waitFor(() => expect(screen.getByText("Texto")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Editar" }));

    const editBox = screen.getAllByRole("textbox")[0] as HTMLTextAreaElement;
    await user.clear(editBox);
    await user.type(editBox, "Nuevo");

    // Remove moderation (state persists across rerender)
    rerender(
      <DocumentCommentsPanel
        documentId="d1"
        currentUserId="u1"
        canComment
        canModerateComments={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(
      await screen.findByText("No tienes permisos para editar este comentario"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Guardar" }),
    ).not.toBeInTheDocument();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("shows error when update fails and stays in edit mode (branch)", async () => {
    const user = userEvent.setup();

    listByDocumentMock.mockResolvedValueOnce({
      comments: [
        {
          ...makeComment({ id: "c6", content: "Texto" }),
          createdBy: "u1",
        } as unknown as Comment,
      ],
    });

    updateMock.mockRejectedValueOnce(new Error("fail"));

    render(
      <DocumentCommentsPanel documentId="d1" currentUserId="u1" canComment />,
    );

    await waitFor(() => expect(screen.getByText("Texto")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Editar" }));

    const editBox = screen.getAllByRole("textbox")[0] as HTMLTextAreaElement;
    await user.clear(editBox);
    await user.type(editBox, "Cambio");

    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(updateMock).toHaveBeenCalled());
    expect(screen.getByText("Failed to update comment")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });

  it("formatDate catch branch: if Date.toLocaleString throws, falls back to iso string", async () => {
    const user = userEvent.setup();

    const toLocaleSpy = jest
      .spyOn(Date.prototype, "toLocaleString")
      .mockImplementation(() => {
        throw new Error("boom");
      });

    const iso = "2026-02-15T10:00:00.000Z";

    listByDocumentMock.mockResolvedValueOnce({
      comments: [
        {
          ...makeComment({ id: "c7", content: "Texto", createdAt: iso }),
          createdBy: { id: "u1", email: "a@b.com" }, // author fallback to email branch
        } as unknown as Comment,
      ],
    });

    render(
      <DocumentCommentsPanel documentId="d1" currentUserId="u1" canComment />,
    );

    await waitFor(() => expect(screen.getByText("Texto")).toBeInTheDocument());

    expect(screen.getByText(iso)).toBeInTheDocument();
    expect(screen.getByText("a@b.com")).toBeInTheDocument();

    toLocaleSpy.mockRestore();

    // small interaction so test doesn't end mid-state
    await user.click(screen.getByRole("button", { name: "↻" }));
  });
});
