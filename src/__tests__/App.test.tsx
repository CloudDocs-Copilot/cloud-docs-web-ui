import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock child components to isolate App test from page complexity
jest.mock('../pages/Home', () => ({
  __esModule: true,
  default: () => <div>Home Page</div>
}));
jest.mock('../pages/Dashboard', () => ({
  __esModule: true,
  default: () => <div>Dashboard Page</div>
}));
jest.mock('../components/UserProfile', () => ({
  UserProfile: () => <div>UserProfile Component</div>
}));

describe('Componente App', () => {
  it('renderiza el componente Home en la ruta por defecto', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renderiza el componente Dashboard en la ruta /dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

   it('renderiza el componente UserProfile en la ruta /profile', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('UserProfile Component')).toBeInTheDocument();
  });
});

