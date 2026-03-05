
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationToast } from '../components/NotificationToast';

describe('Componente NotificationToast', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza el mensaje y el título correctamente cuando está visible', () => {
    render(
      <NotificationToast 
        show={true} 
        onClose={mockOnClose} 
        message="Operación exitosa" 
        title="Éxito" 
        variant="success"
      />
    );

    expect(screen.getByText('Operación exitosa')).toBeInTheDocument();
    expect(screen.getByText('Éxito')).toBeInTheDocument();
  });

  test('usa el título por defecto "Notificación" si no se proporciona uno', () => {
    render(
      <NotificationToast 
        show={true} 
        onClose={mockOnClose} 
        message="Mensaje simple"
      />
    );

    expect(screen.getByText('Notificación')).toBeInTheDocument();
  });

  test('aplica los estilos y el icono de éxito correctamente', () => {
    render(
      <NotificationToast 
        show={true} 
        onClose={mockOnClose} 
        message="Todo bien" 
        variant="success"
      />
    );

    // Verificamos el icono de éxito
    // El componente agrega clases de bootstrap icons: bi-check-circle-fill para success
    // Buscamos un elemento i que tenga esa clase.
    // Testing library no busca bien por clases puras sin roles, pero podemos inspeccionar el container o buscar por texto si hubiera. 
    // Usaremos selector manual para el icono.
    const icon = document.querySelector('.bi-check-circle-fill');
    expect(icon).toBeInTheDocument();
  });

  test('aplica los estilos y el icono de error correctamente', () => {
    render(
      <NotificationToast 
        show={true} 
        onClose={mockOnClose} 
        message="Algo salió mal" 
        variant="danger"
      />
    );

    const icon = document.querySelector('.bi-exclamation-circle-fill');
    expect(icon).toBeInTheDocument();
  });

  test('llama a la función onClose cuando se hace clic en el botón de cerrar', () => {
    render(
      <NotificationToast 
        show={true} 
        onClose={mockOnClose} 
        message="Cierra esto" 
      />
    );

    // React Bootstrap Toast CloseButton suele tener aria-label="Close"
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
