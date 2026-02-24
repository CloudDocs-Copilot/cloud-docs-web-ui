import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import MyDrive from '../MyDrive';

// Mock de los hooks
jest.mock('../../hooks/useOrganization', () => ({
  __esModule: true,
  default: () => ({
    activeOrganization: {
      _id: 'org123',
      id: 'org123',
      name: 'Test Organization',
      plan: 'free',
    },
  }),
}));

jest.mock('../../hooks/usePageInfoTitle', () => ({
  usePageTitle: jest.fn(),
}));

// Mock FileManagerView
jest.mock('../../components/FileManager/FileManagerView', () => ({
  FileManagerView: () => <div data-testid="file-manager">FileManager</div>,
}));

// Mock MainLayout
jest.mock('../../components/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

const renderMyDrive = () => {
  return render(
    <BrowserRouter>
      <MyDrive />
    </BrowserRouter>
  );
};

describe('MyDrive Page', () => {
  it('renders without crashing', () => {
    renderMyDrive();
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });

  it('displays the file manager view', () => {
    renderMyDrive();
    expect(screen.getByTestId('file-manager')).toBeInTheDocument();
  });
});
