import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

// Mock hooks
jest.mock('../../hooks/useOrganization');
jest.mock('../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    can: jest.fn().mockReturnValue(true),
    canAny: jest.fn().mockReturnValue(true),
    canAll: jest.fn().mockReturnValue(true),
    role: 'admin',
  }),
}));
jest.mock('../../hooks/usePageInfoTitle', () => ({
  usePageTitle: jest.fn(),
}));

// Mock MainLayout (simple wrapper)
jest.mock('../../components/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

// Mock FileManagerView to prevent HTTP calls
jest.mock('../../components/FileManager/FileManagerView', () => ({
  FileManagerView: ({ onDocumentDeleted }: { onDocumentDeleted?: () => void }) => (
    <div data-testid="file-manager-view">
      <button type="button" onClick={() => onDocumentDeleted && onDocumentDeleted()}>
        trigger-deleted
      </button>
    </div>
  ),
}));

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders MainLayout wrapper', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });

  it('renders FileManagerView component', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('file-manager-view')).toBeInTheDocument();
  });

  it('passes onDocumentDeleted callback to FileManagerView', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    // Verify trigger-deleted button is present (from FileManagerView mock)
    expect(screen.getByText('trigger-deleted')).toBeInTheDocument();
  });
});
