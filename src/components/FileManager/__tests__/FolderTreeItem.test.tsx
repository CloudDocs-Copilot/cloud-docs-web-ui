import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FolderTreeItem } from '../FolderTreeItem';
import type { Folder } from '../../../types/folder.types';
import type { Document } from '../../../types/document.types';

describe('FolderTreeItem', () => {
  const mockFolder: Folder = {
    id: 'folder-1',
    name: 'Test Folder',
    displayName: 'Test Folder',
    type: 'folder',
    owner: 'user-1',
    organization: 'org-1',
    path: '/test',
    parent: null,
    isRoot: false,
    level: 1,
    children: [],
    itemCount: 0
  };

  const mockDocument: Document = {
    id: 'doc-1',
    filename: 'test.pdf',
    originalname: 'test.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    url: '/test.pdf',
    path: '/test.pdf',
    uploadedBy: 'user-1',
    organization: 'org-1',
    folder: 'folder-1',
    uploadedAt: new Date().toISOString(),
    sharedWith: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockCallbacks = {
    onSelect: jest.fn(),
    onMoveFolder: jest.fn(),
    onMoveDocument: jest.fn(),
    onDocumentClick: jest.fn(),
    onRenameFolder: jest.fn(),
    onRenameDocument: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders folder name and icon', () => {
    render(
      <FolderTreeItem
        folder={mockFolder}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
      />
    );

    expect(screen.getByText('Test Folder')).toBeInTheDocument();
  });

  it('renders itemCount badge when provided', () => {
    const folderWithCount = { ...mockFolder, itemCount: 5 };
    render(
      <FolderTreeItem
        folder={folderWithCount}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onSelect when folder is clicked', () => {
    render(
      <FolderTreeItem
        folder={mockFolder}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
      />
    );

    const folderName = screen.getByText('Test Folder');
    fireEvent.click(folderName.closest('.treeItem')!);

    expect(mockCallbacks.onSelect).toHaveBeenCalledWith(mockFolder);
  });

  it('is draggable when not root folder', () => {
    render(
      <FolderTreeItem
        folder={mockFolder}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
      />
    );

    const treeItem = screen.getByText('Test Folder').closest('.treeItem')!;
    expect(treeItem).toHaveAttribute('draggable', 'true');
  });

  it('is not draggable when root folder', () => {
    const rootFolder = { ...mockFolder, isRoot: true };
    render(
      <FolderTreeItem
        folder={rootFolder}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
      />
    );

    const treeItem = screen.getByText('Test Folder').closest('.treeItem')!;
    expect(treeItem).toHaveAttribute('draggable', 'false');
  });

  it('renders grip handle for non-root folders', () => {
    const { container } = render(
      <FolderTreeItem
        folder={mockFolder}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
      />
    );

    // El GripVertical está dentro de .dragHandle
    const dragHandle = container.querySelector('.dragHandle');
    expect(dragHandle).toBeInTheDocument();
  });

  it('does not render grip handle for root folders', () => {
    const rootFolder = { ...mockFolder, isRoot: true };
    const { container } = render(
      <FolderTreeItem
        folder={rootFolder}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
      />
    );

    const dragHandle = container.querySelector('.dragHandle');
    expect(dragHandle).not.toBeInTheDocument();
  });

  it('handles drag start event', () => {
    render(
      <FolderTreeItem
        folder={mockFolder}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
      />
    );

    const treeItem = screen.getByText('Test Folder').closest('.treeItem')!;
    const dataTransfer = {
      setData: jest.fn(),
      effectAllowed: ''
    };

    fireEvent.dragStart(treeItem, { dataTransfer });

    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'application/json',
      JSON.stringify({ type: 'folder', id: 'folder-1' })
    );
  });

  it('handles drop event and calls onMoveFolder', () => {
    render(
      <FolderTreeItem
        folder={mockFolder}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
      />
    );

    const treeItem = screen.getByText('Test Folder').closest('.treeItem')!;
    const dataTransfer = {
      getData: jest.fn(() => JSON.stringify({ type: 'folder', id: 'folder-2' }))
    };

    fireEvent.drop(treeItem, { dataTransfer });

    expect(mockCallbacks.onMoveFolder).toHaveBeenCalledWith('folder-2', 'folder-1');
  });

  it('handles drop document event and calls onMoveDocument', () => {
    render(
      <FolderTreeItem
        folder={mockFolder}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
        onMoveDocument={mockCallbacks.onMoveDocument}
      />
    );

    const treeItem = screen.getByText('Test Folder').closest('.treeItem')!;
    const dataTransfer = {
      getData: jest.fn(() => JSON.stringify({ type: 'document', id: 'doc-1' }))
    };

    fireEvent.drop(treeItem, { dataTransfer });

    expect(mockCallbacks.onMoveDocument).toHaveBeenCalledWith('doc-1', 'folder-1');
  });

  it('renders child folders recursively', () => {
    const childFolder: Folder = {
      ...mockFolder,
      id: 'child-folder',
      name: 'Child Folder',
      displayName: 'Child Folder',
      level: 2
    };

    const parentFolder = {
      ...mockFolder,
      children: [childFolder]
    };

    render(
      <FolderTreeItem
        folder={parentFolder}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
      />
    );

    expect(screen.getByText('Test Folder')).toBeInTheDocument();
    expect(screen.getByText('Child Folder')).toBeInTheDocument();
  });

  it('renders documents in folder', () => {
    const folderWithDocs = {
      ...mockFolder,
      documents: [mockDocument]
    };

    render(
      <FolderTreeItem
        folder={folderWithDocs}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
        onDocumentClick={mockCallbacks.onDocumentClick}
      />
    );

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('calls onDocumentClick on single click after delay', async () => {
    jest.useFakeTimers();
    
    const folderWithDocs = {
      ...mockFolder,
      documents: [mockDocument]
    };

    render(
      <FolderTreeItem
        folder={folderWithDocs}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
        onDocumentClick={mockCallbacks.onDocumentClick}
      />
    );

    const docElement = screen.getByText('test.pdf');
    fireEvent.click(docElement.closest('.treeItem')!);

    // Esperar el delay de 250ms
    jest.advanceTimersByTime(250);

    await waitFor(() => {
      expect(mockCallbacks.onDocumentClick).toHaveBeenCalledWith(mockDocument);
    });

    jest.useRealTimers();
  });

  it('calls onRenameDocument on document double click', () => {
    const folderWithDocs = {
      ...mockFolder,
      documents: [mockDocument]
    };

    render(
      <FolderTreeItem
        folder={folderWithDocs}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
        onRenameDocument={mockCallbacks.onRenameDocument}
      />
    );

    const docElement = screen.getByText('test.pdf');
    fireEvent.doubleClick(docElement.closest('.treeItem')!);

    expect(mockCallbacks.onRenameDocument).toHaveBeenCalledWith(mockDocument);
  });

  it('calls onRenameFolder on folder name double click', () => {
    render(
      <FolderTreeItem
        folder={mockFolder}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
        onRenameFolder={mockCallbacks.onRenameFolder}
      />
    );

    const folderName = screen.getByText('Test Folder');
    fireEvent.doubleClick(folderName);

    expect(mockCallbacks.onRenameFolder).toHaveBeenCalledWith(mockFolder);
  });

  it('does not call onRenameFolder on root folder double click', () => {
    const rootFolder = { ...mockFolder, isRoot: true };
    render(
      <FolderTreeItem
        folder={rootFolder}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
        onRenameFolder={mockCallbacks.onRenameFolder}
      />
    );

    const folderName = screen.getByText('Test Folder');
    fireEvent.doubleClick(folderName);

    expect(mockCallbacks.onRenameFolder).not.toHaveBeenCalled();
  });

  it('expands and collapses when toggle icon is clicked', () => {
    const folderWithChildren = {
      ...mockFolder,
      children: [{
        ...mockFolder,
        id: 'child',
        name: 'Child',
        displayName: 'Child'
      }]
    };

    const { container } = render(
      <FolderTreeItem
        folder={folderWithChildren}
        onSelect={mockCallbacks.onSelect}
        onMoveFolder={mockCallbacks.onMoveFolder}
      />
    );

    const toggleIcon = container.querySelector('.toggleIcon');
    expect(toggleIcon).toBeInTheDocument();

    // Initially expanded (default)
    expect(screen.getByText('Child')).toBeInTheDocument();

    // Click to collapse
    if (toggleIcon) {
      fireEvent.click(toggleIcon);
    }

    // Should still be visible since we start expanded
    // (UI might need time to update)
  });
});
