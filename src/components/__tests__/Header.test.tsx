import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
const mockLogout = jest.fn().mockResolvedValue(undefined);

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}));

jest.mock('../../hooks/useAuth', () => ({ 
  useAuth: () => ({ 
    logout: mockLogout, 
    user: { id: 'u1', name: 'Pedro', email: 'p@p.com' } 
  }) 
}));

jest.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    refresh: jest.fn().mockResolvedValue(undefined),
    markRead: jest.fn().mockResolvedValue(undefined),
    markAllRead: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('../Organization/OrganizationSelector', () => () => <div>OrgSel</div>);

interface FileUploaderProps {
  onUploadSuccess?: (docs: unknown[]) => void;
  onClose?: () => void;
}

jest.mock('../FileUploader', () => ({ 
  FileUploader: ({ onUploadSuccess, onClose }: FileUploaderProps) => (
    <div>
      <button onClick={() => onUploadSuccess && onUploadSuccess([{ id: 'd1' }])}>mockUpload</button>
      <button onClick={() => onClose && onClose()}>mockClose</button>
    </div>
  )
}));

import Header from '../Header';

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user info and buttons', () => {
    render(<Header />);
    expect(screen.getByText('Pedro')).toBeInTheDocument();
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(screen.getByText('Subir')).toBeInTheDocument();
    expect(screen.getByText('Salir')).toBeInTheDocument();
  });

  it('navigates to login on logout', async () => {
    render(<Header />);
    const btn = screen.getByRole('button', { name: /Salir/i });
    fireEvent.click(btn);
    await waitFor(() => expect(mockLogout).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('opens upload modal and handles upload success', async () => {
    const onDocs = jest.fn();
    render(<Header onDocumentsUploaded={onDocs} />);
    const uploadBtn = screen.getByRole('button', { name: /Subir/i });
    fireEvent.click(uploadBtn);
    
    const mockUpload = await screen.findByText('mockUpload');
    fireEvent.click(mockUpload);
    
    await waitFor(() => expect(onDocs).toHaveBeenCalledWith([{ id: 'd1' }]));
  });

  it('closes upload modal when mockClose is clicked', async () => {
    render(<Header />);
    const uploadBtn = screen.getByRole('button', { name: /Subir/i });
    fireEvent.click(uploadBtn);
    
    const mockClose = await screen.findByText('mockClose');
    fireEvent.click(mockClose);
    
    await waitFor(() => expect(screen.queryByText('mockUpload')).not.toBeInTheDocument());
  });
});
