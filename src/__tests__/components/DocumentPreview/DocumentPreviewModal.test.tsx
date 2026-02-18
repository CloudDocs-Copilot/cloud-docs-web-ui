/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DocumentPreviewModal } from '../../../components/DocumentPreview/DocumentPreviewModal';
import { DocumentPreviewType } from '../../../types/preview.types';
import type { PreviewDocument } from '../../../types/preview.types';
import * as previewServiceModule from '../../../services/preview.service';
import { apiClient } from '../../../api';

// --- Mock viewers
jest.mock('../../../components/DocumentPreview/PDFViewer', () => ({
  PDFViewer: ({ filename }: { filename: string }) => <div>PDFViewer: {filename}</div>,
}));
jest.mock('../../../components/DocumentPreview/ImageViewer', () => ({
  ImageViewer: ({ filename }: { filename: string }) => <div>ImageViewer: {filename}</div>,
}));
jest.mock('../../../components/DocumentPreview/VideoPlayer', () => ({
  VideoPlayer: ({ filename }: { filename: string }) => <div>VideoPlayer: {filename}</div>,
}));
jest.mock('../../../components/DocumentPreview/TextViewer', () => ({
  TextViewer: ({ filename }: { filename: string }) => <div>TextViewer: {filename}</div>,
}));
jest.mock('../../../components/DocumentPreview/OfficeViewer', () => ({
  OfficeViewer: ({ filename }: { filename: string }) => <div>OfficeViewer: {filename}</div>,
}));

jest.mock('../../../components/Sidebar', () => ({
  __esModule: true,
  default: () => <div>Sidebar</div>,
}));

// Mock comments panel
jest.mock('../../../components/Comments/DocumentCommentsPanel', () => ({
  __esModule: true,
  default: ({
    documentId,
    currentUserId,
    canComment,
    canModerateComments,
  }: {
    documentId: string;
    currentUserId: string;
    canComment: boolean;
    canModerateComments: boolean;
  }) => (
    <div data-testid="comments-panel">
      doc:{documentId}|user:{currentUserId}|canComment:{String(canComment)}|canMod:{String(canModerateComments)}
    </div>
  ),
}));

// ✅ Capture uploadHandler so tests can assert rejections reliably
let lastUploadHandler: ((files: File[]) => Promise<unknown>) | null = null;

// Mock FileUploader - expose uploadHandler and controls
jest.mock('../../../components/FileUploader', () => ({
  __esModule: true,
  default: ({
    uploadHandler,
    onClose,
    onUploadSuccess,
  }: {
    uploadHandler: (files: File[]) => Promise<unknown>;
    onClose: () => void;
    onUploadSuccess: () => void;
  }) => {
    // store handler for direct invocation in tests
    lastUploadHandler = uploadHandler;

    return (
      <div data-testid="file-uploader">
        <button
          type="button"
          onClick={() => {
            const f = new File(['hello'], 'replacement.pdf', { type: 'application/pdf' });
            void uploadHandler([f]).then(() => onUploadSuccess());
          }}
        >
          doUpload
        </button>
        <button type="button" onClick={onClose}>
          doClose
        </button>
      </div>
    );
  },
}));

// Mock previewService
jest.mock('../../../services/preview.service', () => ({
  previewService: {
    getPreviewType: jest.fn(),
    getPreviewUrl: jest.fn(),
    canPreview: jest.fn(),
    formatFileSize: jest.fn((size: number) => `${size} bytes`),
  },
}));

// avoid hoist issues AND avoid "use*" naming to keep eslint react-hooks happy
let orgImpl: () => { activeOrganization: unknown } = () => ({
  activeOrganization: { role: 'admin' },
});

jest.mock('../../../hooks/useOrganization', () => ({
  __esModule: true,
  default: () => orgImpl(),
}));

let authImpl: () => { user: unknown } = () => ({
  user: { id: 'u1', name: 'User', email: 'user@example.com' },
});

jest.mock('../../../hooks/useAuth', () => ({
  __esModule: true,
  useAuth: () => authImpl(),
}));

// Mock apiClient.post
jest.mock('../../../api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe('DocumentPreviewModal', () => {
  const mockOnHide = jest.fn<void, []>();

  const previewService = previewServiceModule.previewService as jest.Mocked<
    typeof previewServiceModule.previewService
  >;

  const apiPost = apiClient.post as unknown as jest.MockedFunction<
    (url: string, body: unknown, opts: unknown) => Promise<unknown>
  >;

  const createMockDocument = (overrides?: Partial<PreviewDocument>): PreviewDocument => ({
    id: '1',
    filename: 'test.pdf',
    originalname: 'test.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    url: '/file.pdf',
    path: '/path',
    uploadedBy: 'u1',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    lastUploadHandler = null;

    previewService.getPreviewUrl.mockReturnValue('https://example.com/document.pdf');
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.PDF);
    previewService.canPreview.mockReturnValue(true);
    previewService.formatFileSize.mockReturnValue('1 KB');

    orgImpl = () => ({ activeOrganization: { role: 'admin' } });
    authImpl = () => ({ user: { id: 'u1', name: 'User', email: 'user@example.com' } });

    apiPost.mockResolvedValue({
      data: {
        message: 'ok',
        document: createMockDocument({ filename: 'replaced.pdf', originalname: 'replaced.pdf' }),
      },
    });
  });

  it('renders modal when show is true and renders Sidebar + comments panel', () => {
    const document = createMockDocument();

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('comments-panel')).toBeInTheDocument();
  });

  it('passes derived permissions into DocumentCommentsPanel (admin => canModerateComments=true, viewer => canComment=false)', () => {
    const doc = createMockDocument({ id: 'doc-1' });

    orgImpl = () => ({ activeOrganization: { role: 'admin' } });

    const { rerender } = render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={doc} />);

    expect(screen.getByTestId('comments-panel')).toHaveTextContent('doc:doc-1');
    expect(screen.getByTestId('comments-panel')).toHaveTextContent('canMod:true');
    expect(screen.getByTestId('comments-panel')).toHaveTextContent('canComment:true');

    orgImpl = () => ({ activeOrganization: { role: 'viewer' } });
    rerender(<DocumentPreviewModal show={true} onHide={mockOnHide} document={doc} />);

    expect(screen.getByTestId('comments-panel')).toHaveTextContent('canMod:false');
    expect(screen.getByTestId('comments-panel')).toHaveTextContent('canComment:false');
  });

  it('renders PDFViewer for PDF documents', () => {
    const document = createMockDocument({ mimeType: 'application/pdf' });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.PDF);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    expect(screen.getByText('PDFViewer: test.pdf')).toBeInTheDocument();
  });

  it('renders ImageViewer for image documents', () => {
    const document = createMockDocument({
      filename: 'photo.jpg',
      originalname: 'photo.jpg',
      mimeType: 'image/jpeg',
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.IMAGE);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    expect(screen.getByText('ImageViewer: photo.jpg')).toBeInTheDocument();
  });

  it('renders VideoPlayer for video documents', () => {
    const document = createMockDocument({
      filename: 'video.mp4',
      originalname: 'video.mp4',
      mimeType: 'video/mp4',
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.VIDEO);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    expect(screen.getByText('VideoPlayer: video.mp4')).toBeInTheDocument();
  });

  it('renders TextViewer for text documents', () => {
    const document = createMockDocument({
      filename: 'readme.txt',
      originalname: 'readme.txt',
      mimeType: 'text/plain',
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.TEXT);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    expect(screen.getByText('TextViewer: readme.txt')).toBeInTheDocument();
  });

  it('renders TextViewer for code documents', () => {
    const document = createMockDocument({
      filename: 'app.js',
      originalname: 'app.js',
      mimeType: 'application/javascript',
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.CODE);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    expect(screen.getByText('TextViewer: app.js')).toBeInTheDocument();
  });

  it('renders OfficeViewer for Office documents', () => {
    const document = createMockDocument({
      filename: 'document.docx',
      originalname: 'document.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.OFFICE);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    expect(screen.getByText('OfficeViewer: document.docx')).toBeInTheDocument();
  });

  it('renders audio player for audio documents AND shows modal header (shouldShowModalHeader=true)', () => {
    const document = createMockDocument({
      filename: 'song.mp3',
      originalname: 'song.mp3',
      mimeType: 'audio/mpeg',
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.AUDIO);
    previewService.canPreview.mockReturnValue(true);
    previewService.getPreviewUrl.mockReturnValue('https://example.com/song.mp3');

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    expect(screen.getAllByText(/song\.mp3/i).length).toBeGreaterThan(0);
  });

  it('shows warning when preview is not available and provides download link with nonce', () => {
    const document = createMockDocument({
      filename: 'archive.zip',
      mimeType: 'application/zip',
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.UNSUPPORTED);
    previewService.canPreview.mockReturnValue(false);
    previewService.getPreviewUrl.mockReturnValue('https://example.com/file.zip');

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    expect(screen.getByText('Preview Not Available')).toBeInTheDocument();

    const downloadLink = screen.getByRole('link', { name: /download file/i });
    expect(downloadLink.getAttribute('href')).toMatch(/^https:\/\/example\.com\/file\.zip\?_v=\d+$/);
    expect(downloadLink).toHaveAttribute('download');
  });

  it('shows unsupported message for default/unsupported preview type when canPreview=true (default switch branch)', () => {
    const document = createMockDocument();
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.UNSUPPORTED);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    expect(screen.getByText('Unsupported File Type')).toBeInTheDocument();
  });

  it('does not show modal header for PDF documents (shouldShowModalHeader=false)', () => {
    const document = createMockDocument();
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.PDF);
    previewService.canPreview.mockReturnValue(true);

    const { container } = render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    const modalHeader = container.querySelector('.modal-header');
    expect(modalHeader).not.toBeInTheDocument();
  });

  it('shows "Reemplazar" button when canReplaceFile=true and toggles FileUploader, then close hides uploader (branches)', async () => {
    const user = userEvent.setup();

    orgImpl = () => ({ activeOrganization: { role: 'owner' } });

    const document = createMockDocument();

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    const replaceBtn = screen.getByRole('button', { name: 'Reemplazar' });
    await user.click(replaceBtn);

    expect(screen.getByTestId('file-uploader')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'doClose' }));
    await waitFor(() => expect(screen.queryByTestId('file-uploader')).not.toBeInTheDocument());
  });

  it('does not show replace button when user cannot replace (viewer role and not uploader) (branch)', () => {
    orgImpl = () => ({ activeOrganization: { role: 'viewer' } });
    authImpl = () => ({ user: { id: 'uX' } });

    const document = createMockDocument({ uploadedBy: 'u1' });

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    expect(screen.queryByRole('button', { name: 'Reemplazar' })).not.toBeInTheDocument();
  });

  it('allows replace when current user is the uploader (uploadedBy matches user id) (branch)', () => {
    orgImpl = () => ({ activeOrganization: { role: 'member' } });
    authImpl = () => ({ user: { id: 'u1' } });

    const document = createMockDocument({ uploadedBy: 'u1' });

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    expect(screen.getByRole('button', { name: 'Reemplazar' })).toBeInTheDocument();
  });

  it('handleReplaceUpload success updates local doc, hides uploader, and calls apiClient.post with correct endpoint', async () => {
    const user = userEvent.setup();

    orgImpl = () => ({ activeOrganization: { role: 'admin' } });
    authImpl = () => ({ user: { id: 'u1' } });

    const doc = createMockDocument({ id: undefined, _id: 'mongo-doc-1' } as unknown as PreviewDocument);

    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.AUDIO);
    previewService.getPreviewUrl.mockReturnValue('https://example.com/song.mp3');

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={doc} />);

    await user.click(screen.getByRole('button', { name: 'Reemplazar' }));
    expect(screen.getByTestId('file-uploader')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'doUpload' }));

    await waitFor(() => expect(apiPost).toHaveBeenCalledTimes(1));
    expect(apiPost.mock.calls[0][0]).toBe('/documents/mongo-doc-1/replace');

    await waitFor(() => expect(screen.queryByTestId('file-uploader')).not.toBeInTheDocument());
  });

  it('handleReplaceUpload throws with message when response missing document, and can read message from response (branches)', async () => {
    const user = userEvent.setup();

    orgImpl = () => ({ activeOrganization: { role: 'admin' } });

    const document = createMockDocument({ id: 'doc-1' });

    apiPost.mockResolvedValueOnce({
      data: {
        message: 'custom failure',
        document: undefined,
      },
    });

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);

    await user.click(screen.getByRole('button', { name: 'Reemplazar' }));
    expect(screen.getByTestId('file-uploader')).toBeInTheDocument();

    // ✅ Assert rejection by calling the captured handler directly (reliable)
    expect(lastUploadHandler).toBeTruthy();
    const handler = lastUploadHandler as (files: File[]) => Promise<unknown>;
    const f = new File(['hello'], 'replacement.pdf', { type: 'application/pdf' });

    await expect(handler([f])).rejects.toThrow('custom failure');

    // uploader remains visible because upload failed and onUploadSuccess not called
    expect(screen.getByTestId('file-uploader')).toBeInTheDocument();
  });

  it('useEffect resets replace state when document changes (branches)', async () => {
    const user = userEvent.setup();

    orgImpl = () => ({ activeOrganization: { role: 'owner' } });

    const doc1 = createMockDocument({ id: 'doc-1', filename: 'a.pdf', originalname: 'a.pdf' });
    const doc2 = createMockDocument({ id: 'doc-2', filename: 'b.pdf', originalname: 'b.pdf' });

    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.AUDIO);
    previewService.getPreviewUrl.mockReturnValue('https://example.com/audio.mp3');

    const { rerender } = render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={doc1} />);

    await user.click(screen.getByRole('button', { name: 'Reemplazar' }));
    expect(screen.getByTestId('file-uploader')).toBeInTheDocument();

    rerender(<DocumentPreviewModal show={true} onHide={mockOnHide} document={doc2} />);
    await waitFor(() => expect(screen.queryByTestId('file-uploader')).not.toBeInTheDocument());
  });
});
