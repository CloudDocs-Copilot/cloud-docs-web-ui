import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NoOrganization from '../NoOrganization';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('NoOrganization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <NoOrganization />
      </BrowserRouter>
    );
  });

  it('displays the main heading', () => {
    render(
      <BrowserRouter>
        <NoOrganization />
      </BrowserRouter>
    );

    expect(screen.getByText('No tienes una organización activa')).toBeInTheDocument();
  });

  it('displays the descriptive message', () => {
    render(
      <BrowserRouter>
        <NoOrganization />
      </BrowserRouter>
    );

    expect(screen.getByText(/Para continuar, crea una organización/i)).toBeInTheDocument();
  });

  it('renders link to create organization', () => {
    render(
      <BrowserRouter>
        <NoOrganization />
      </BrowserRouter>
    );

    const createOrgLink = screen.getByText('Crear organización');
    expect(createOrgLink).toBeInTheDocument();
    expect(createOrgLink).toHaveAttribute('href', '/create-organization');
  });

  it('navigates to home when "Ir a Inicio" is clicked', () => {
    render(
      <BrowserRouter>
        <NoOrganization />
      </BrowserRouter>
    );

    const homeButton = screen.getByText('Ir a Inicio');
    fireEvent.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('displays the footer message', () => {
    render(
      <BrowserRouter>
        <NoOrganization />
      </BrowserRouter>
    );

    expect(screen.getByText(/Puedes volver al inicio en cualquier momento/i)).toBeInTheDocument();
  });
});
