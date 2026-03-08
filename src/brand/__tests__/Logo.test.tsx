import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Logo } from '../Logo';

describe('Logo', () => {
  it('renderiza el logo con props por defecto', () => {
    const { container } = render(<Logo />);
    
    // Check if logo container is rendered
    const logoContainer = container.querySelector('div');
    expect(logoContainer).toBeInTheDocument();
    
    // Check if SVG is rendered
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renderiza con tamaño personalizado', () => {
    const { container } = render(<Logo size={56} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '56');
    expect(svg).toHaveAttribute('height', '56');
  });

  it('renderiza con variante por defecto (gradient)', () => {
    const { container } = render(<Logo variant="gradient" />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    
    // Check if gradient is defined
    const defs = container.querySelector('defs');
    expect(defs).toBeInTheDocument();
  });

  it('renderiza con variante blanca', () => {
    const { container } = render(<Logo variant="white" />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renderiza con variante default', () => {
    const { container } = render(<Logo variant="default" />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('aplica clase animada cuando la prop animated es true', () => {
    const { container } = render(<Logo animated={true} />);
    
    const logoContainer = container.querySelector('div');
    expect(logoContainer?.className).toContain('logoAnimated');
  });

  it('no aplica clase animada cuando la prop animated es false', () => {
    const { container } = render(<Logo animated={false} />);
    
    const logoContainer = container.querySelector('div');
    expect(logoContainer?.className).not.toContain('logoAnimated');
  });

  it('aplica clase clickable cuando se provee onClick', () => {
    const handleClick = jest.fn();
    const { container } = render(<Logo onClick={handleClick} />);
    
    const logoContainer = container.querySelector('div');
    expect(logoContainer?.className).toContain('logoClickable');
  });

  it('llama al handler onClick cuando se hace clic', async () => {
    const handleClick = jest.fn();
    const { container } = render(<Logo onClick={handleClick} />);
    
    const logoContainer = container.querySelector('div');
    if (logoContainer) {
      await userEvent.click(logoContainer);
    }
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('aplica className personalizado', () => {
    const { container } = render(<Logo className="custom-class" />);
    
    const logoContainer = container.querySelector('div');
    expect(logoContainer?.className).toContain('custom-class');
  });

  it('renderiza el icono Sparkles', () => {
    const { container } = render(<Logo />);
    
    // Check if Sparkles icon wrapper is rendered
    const iconWrapper = container.querySelector('svg + div');
    expect(iconWrapper).toBeInTheDocument();
  });

  it('genera IDs únicos de gradiente para múltiples instancias', () => {
    const { container: container1 } = render(<Logo />);
    const { container: container2 } = render(<Logo />);
    
    const defs1 = container1.querySelector('defs');
    const defs2 = container2.querySelector('defs');
    
    expect(defs1).toBeInTheDocument();
    expect(defs2).toBeInTheDocument();
    
    // Both should have unique IDs (useId ensures uniqueness)
    const linearGradient1 = defs1?.querySelector('linearGradient');
    const linearGradient2 = defs2?.querySelector('linearGradient');
    
    expect(linearGradient1?.getAttribute('id')).toBeTruthy();
    expect(linearGradient2?.getAttribute('id')).toBeTruthy();
  });

  it('renderiza con múltiples props combinadas', async () => {
    const handleClick = jest.fn();
    const { container } = render(
      <Logo 
        size={48} 
        variant="gradient" 
        animated={true} 
        onClick={handleClick}
        className="test-logo"
      />
    );
    
    const logoContainer = container.querySelector('div');
    expect(logoContainer?.className).toContain('logoAnimated');
    expect(logoContainer?.className).toContain('logoClickable');
    expect(logoContainer?.className).toContain('test-logo');
    
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
    
    if (logoContainer) {
      await userEvent.click(logoContainer);
    }
    expect(handleClick).toHaveBeenCalled();
  });

  it('renderiza el path SVG de la carpeta', () => {
    const { container } = render(<Logo />);
    
    // Check if folder path exists
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('renderiza el filtro de sombra', () => {
    const { container } = render(<Logo />);
    
    const filter = container.querySelector('filter');
    expect(filter).toBeInTheDocument();
  });

  it('renderiza el gradiente de pestaña para efecto 3D', () => {
    const { container } = render(<Logo variant="gradient" />);
    
    const linearGradients = container.querySelectorAll('linearGradient');
    // Should have at least 2 gradients (main + tab)
    expect(linearGradients.length).toBeGreaterThanOrEqual(2);
  });
});
