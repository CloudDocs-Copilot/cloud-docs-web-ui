import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyDrive from '../MyDrive';
import { AuthProvider } from '../../context/AuthContext';
import { OrganizationProvider } from '../../context/OrganizationContext';
import { PageProvider } from '../../context/PageContext';

// Mock de los hooks y servicios
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

jest.mock('../../services/folder.service', () => ({
  folderService: {
    getFolderTree: jest.fn().mockResolvedValue({ 
      _id: 'root123',
      name: 'Root',
      subfolders: [] 
    }),
    getFolderContents: jest.fn().mockResolvedValue({ 
      subfolders: [], 
      documents: [] 
    }),
  },
}));

jest.mock('../../services/document.service', () => ({
  getDocumentsByFolder: jest.fn().mockResolvedValue([]),
}));

const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  name: 'Test User',
};

const renderMyDrive = () => {
  return render(
    <BrowserRouter>
      <AuthProvider user={mockUser}>
        <OrganizationProvider>
          <PageProvider>
            <MyDrive />
          </PageProvider>
        </OrganizationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('MyDrive Page', () => {
  it('renders without crashing', () => {
    renderMyDrive();
    expect(screen.getByText(/Mi Unidad/i)).toBeInTheDocument();
  });

  it('displays the file manager view', () => {
    renderMyDrive();
    // FileManagerView debería renderizarse
    expect(document.querySelector('.container')).toBeInTheDocument();
  });
});
