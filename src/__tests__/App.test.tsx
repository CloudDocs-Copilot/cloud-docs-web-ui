import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  it('renders the app with initial count', () => {
    render(<App />);
    expect(screen.getByText(/count is 0/i)).toBeInTheDocument();
  });

  it('increments count when button is clicked', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /count is 0/i });
    
    fireEvent.click(button);
    
    expect(screen.getByText(/count is 1/i)).toBeInTheDocument();
  });

  it('renders Vite and React logos', () => {
    render(<App />);
    const logos = screen.getAllByRole('img');
    
    expect(logos).toHaveLength(2);
    expect(logos[0]).toHaveAttribute('alt', 'Vite logo');
    expect(logos[1]).toHaveAttribute('alt', 'React logo');
  });
});
