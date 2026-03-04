import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

// Mock the LoginForm component
jest.mock('../../components/LoginForm/LoginForm', () => {
  return function MockLoginForm() {
    return <div data-testid="login-form">Login Form Component</div>;
  };
});

describe('LoginPage', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
  });

  it('renders the LoginForm component', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('displays login form content', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Login Form Component')).toBeInTheDocument();
  });
});
