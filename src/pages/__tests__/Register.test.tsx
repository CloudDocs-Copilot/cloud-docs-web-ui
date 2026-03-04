import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';

// Mock the RegisterForm component
jest.mock('../../components/RegisterForm', () => {
  return function MockRegisterForm() {
    return <div data-testid="register-form">Register Form Component</div>;
  };
});

describe('Register', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  });

  it('renders the RegisterForm component', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });

  it('displays register form content', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByText('Register Form Component')).toBeInTheDocument();
  });

  it('applies container styles', () => {
    const { container } = render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const divElement = container.querySelector('div');
    expect(divElement).toHaveClass('container');
  });
});
