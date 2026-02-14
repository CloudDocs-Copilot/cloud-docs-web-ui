import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { DangerZone } from '../DangerZone';

describe('DangerZone', () => {
  it('renders title and button', () => {
    render(<DangerZone />);
    expect(screen.getByText(/Zona de Peligro/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Eliminar cuenta/i })).toBeInTheDocument();
  });

  it('calls onDeleteAccount when button clicked', () => {
    const mock = jest.fn();
    render(<DangerZone onDeleteAccount={mock} />);
    fireEvent.click(screen.getByRole('button', { name: /Eliminar cuenta/i }));
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('renders icon classes inside title and button', () => {
    render(<DangerZone />);
    const titleIcon = document.querySelector('.bi-exclamation-triangle-fill');
    const trashIcon = document.querySelector('.bi-trash');
    expect(titleIcon).toBeTruthy();
    expect(trashIcon).toBeTruthy();
  });
});
