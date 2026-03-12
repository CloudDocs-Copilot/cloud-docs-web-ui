import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotFound from '../pages/NotFound';

// Mock del hook usePageTitle para evitar errores de contexto (ya que usa PageProvider internamente)
jest.mock('../hooks/usePageInfoTitle', () => ({
  usePageTitle: jest.fn(),
}));

// 1. Mock de useNavigate
// Necesitamos simular useNavigate porque el componente lo usa para redirigir.
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Mantiene otras funciones del router si fueran necesarias
  useNavigate: () => mockNavigate,
}));

describe('Componente NotFound', () => {
  beforeEach(() => {
    // Limpiamos el mock antes de cada test para evitar interferencias
    mockNavigate.mockClear();
  });

  test('debe renderizar el encabezado 404 y el mensaje de error', () => {
    render(<NotFound />);
    
    // Verificamos elementos de UI requeridos en la historia de usuario
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Carpeta vacía')).toBeInTheDocument();
    
    // Verificar mensaje descriptivo
    expect(screen.getByText(/Esta ubicación no contiene documentos/i)).toBeInTheDocument();
    expect(screen.getByText(/Ni siquiera con IA logramos encontrarla/i)).toBeInTheDocument();
  });

  test('debe contener un botón funcional para volver al inicio', () => {
    render(<NotFound />);
    
    // Usamos getByRole para asegurar accesibilidad (es un botón real)
    const backButton = screen.getByRole('button', { name: /regresar a mis archivos/i });
    expect(backButton).toBeInTheDocument();
    
    // Simulamos el click
    fireEvent.click(backButton);

    // Verificamos que se llamó a la función de navegación con la ruta correcta ('/')
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});