import { render, screen, fireEvent } from '@testing-library/react';
import { PersonalInfoSection } from '../PersonalInfoSection';

describe('PersonalInfoSection', () => {
  it('renders name and email', () => {
    render(<PersonalInfoSection name="John" email="j@e.com" onNameChange={() => {}} onEmailChange={() => {}} />);
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('j@e.com')).toBeInTheDocument();
  });

  it('calls onNameChange and onBlur', () => {
    const onNameChange = jest.fn();
    const onBlur = jest.fn();
    render(<PersonalInfoSection name="" email="" onNameChange={onNameChange} onEmailChange={() => {}} onBlur={onBlur} />);
    const input = screen.getByRole('textbox', { name: /Nombre completo/i });
    fireEvent.change(input, { target: { value: 'Alice' } });
    fireEvent.blur(input, { target: { value: 'Alice' } });
    expect(onNameChange).toHaveBeenCalledWith('Alice');
    expect(onBlur).toHaveBeenCalledWith('name', 'Alice');
  });

  it('shows validation errors when provided', () => {
    render(<PersonalInfoSection name="" email="" onNameChange={() => {}} onEmailChange={() => {}} errors={{ name: 'errName', email: 'errEmail' }} />);
    expect(screen.getByText('errName')).toBeInTheDocument();
    expect(screen.getByText('errEmail')).toBeInTheDocument();
  });
});
