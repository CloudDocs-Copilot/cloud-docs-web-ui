import React from 'react';
import { Button, Container, Alert } from 'react-bootstrap';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches runtime render errors and displays a fallback UI.
 * This is the only class component in the application (required by React for Error Boundaries).
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="text-center">
            <Alert variant="danger" className="mb-4">
              <Alert.Heading>Algo salió mal</Alert.Heading>
              <p className="mb-0">
                Ocurrió un error inesperado. Por favor, intenta recargar la página.
              </p>
            </Alert>
            <Button variant="primary" onClick={this.handleReload}>
              Recargar página
            </Button>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
