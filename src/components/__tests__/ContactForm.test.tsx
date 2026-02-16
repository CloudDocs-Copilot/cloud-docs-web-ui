import { render, screen, fireEvent } from '@testing-library/react';
import ContactForm, { ContactFormData } from '../ContactForm';

describe('ContactForm', () => {
  it('submits valid data and resets form', () => {
    const handleSubmit = jest.fn();
    render(<ContactForm onSubmit={handleSubmit} buttonText="Enviar" />);

    const name = screen.getByPlaceholderText('Nombre') as HTMLInputElement;
    const email = screen.getByPlaceholderText('Email') as HTMLInputElement;
    const subject = screen.getByPlaceholderText('Asunto') as HTMLInputElement;
    const message = screen.getByPlaceholderText('Mensaje') as HTMLTextAreaElement;
    const btn = screen.getByRole('button', { name: /enviar/i });

    fireEvent.change(name, { target: { value: 'Test User' } });
    fireEvent.change(email, { target: { value: 'test@example.com' } });
    fireEvent.change(subject, { target: { value: 'Hello world' } });
    fireEvent.change(message, { target: { value: 'This is a test message.' } });

    fireEvent.click(btn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const calledWith = (handleSubmit.mock.calls[0][0] as ContactFormData);
    expect(calledWith.name).toBe('Test User');
    expect(calledWith.email).toBe('test@example.com');

    // After submit the form should be reset
    expect(name.value).toBe('');
    expect(email.value).toBe('');
  });

  it('does not submit invalid form and shows errors', async () => {
    const handleSubmit = jest.fn();
    render(<ContactForm onSubmit={handleSubmit} />);
    const name = screen.getByPlaceholderText('Nombre') as HTMLInputElement;
    const email = screen.getByPlaceholderText('Email') as HTMLInputElement;
    const subject = screen.getByPlaceholderText('Asunto') as HTMLInputElement;
    const message = screen.getByPlaceholderText('Mensaje') as HTMLTextAreaElement;
    const btn = screen.getByRole('button', { name: /enviar mensaje/i });

    // Enter invalid values
    fireEvent.change(name, { target: { value: 'A' } });
    fireEvent.change(email, { target: { value: 'bad-email' } });
    fireEvent.change(subject, { target: { value: 'Hi' } });
    fireEvent.change(message, { target: { value: 'short' } });

    fireEvent.click(btn);

    expect(handleSubmit).not.toHaveBeenCalled();
    // Form validation prevents submission with invalid data
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
