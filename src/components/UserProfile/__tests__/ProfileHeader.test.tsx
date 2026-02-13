import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileHeader } from '../ProfileHeader';

describe('ProfileHeader', () => {
  it('renders name and email', () => {
    render(<ProfileHeader name="Juan" email="juan@example.com" />);
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
  });

  it('shows avatar icon when no imageUrl', () => {
    render(<ProfileHeader name="Ana" email="a@b.com" />);
    expect(document.querySelector('.bi-person')).toBeTruthy();
  });

  it('renders an img when imageUrl provided', () => {
    render(<ProfileHeader name="Ana" email="a@b.com" imageUrl="/me.png" />);
    const img = screen.getByAltText('Ana') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('/me.png');
  });

  it('calls onImageSelect when file input changes', () => {
    const onImageSelect = jest.fn();
    render(<ProfileHeader name="X" email="x@x" onImageSelect={onImageSelect} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onImageSelect).toHaveBeenCalled();
  });

  it('clicking camera button does not throw and keeps input present', () => {
    render(<ProfileHeader name="Z" email="z@z" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
  });
});
