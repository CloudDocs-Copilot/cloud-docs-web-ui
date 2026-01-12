import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock child components to isolate App test from page complexity
jest.mock('../pages/Home', () => () => <div>Home Page</div>);
jest.mock('../pages/Dashboard', () => () => <div>Dashboard Page</div>);
jest.mock('../components/UserProfile', () => ({
  UserProfile: () => <div>UserProfile Component</div>
}));

describe('App Component', () => {
  it('renders Home component on default route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders Dashboard component on /dashboard route', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

   it('renders UserProfile component on /profile route', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('UserProfile Component')).toBeInTheDocument();
  });
});

