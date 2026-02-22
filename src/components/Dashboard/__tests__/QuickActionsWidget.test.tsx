import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { QuickActionsWidget } from '../widgets/QuickActionsWidget';
import * as usePermissionsHook from '../../../hooks/usePermissions';

jest.mock('../../../hooks/usePermissions', () => ({
  usePermissions: jest.fn(),
}));

const renderWidget = () =>
  render(
    <BrowserRouter>
      <QuickActionsWidget />
    </BrowserRouter>,
  );

describe('QuickActionsWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows upload, invite, settings, and trash actions for owner', () => {
    (usePermissionsHook.usePermissions as jest.Mock).mockReturnValue({
      can: (action: string) =>
        ['documents:create', 'members:invite', 'settings:view', 'trash:manage'].includes(action),
      role: 'owner',
    });

    renderWidget();

    expect(screen.getByText('Subir documento')).toBeInTheDocument();
    expect(screen.getByText('Invitar miembro')).toBeInTheDocument();
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    expect(screen.getByText('Papelera')).toBeInTheDocument();
  });

  it('shows upload and trash for member (no invite, no settings)', () => {
    (usePermissionsHook.usePermissions as jest.Mock).mockReturnValue({
      can: (action: string) =>
        ['documents:create', 'trash:manage'].includes(action),
      role: 'member',
    });

    renderWidget();

    expect(screen.getByText('Subir documento')).toBeInTheDocument();
    expect(screen.getByText('Papelera')).toBeInTheDocument();
    expect(screen.queryByText('Invitar miembro')).not.toBeInTheDocument();
    expect(screen.queryByText('Configuración')).not.toBeInTheDocument();
  });

  it('shows "Ver compartidos" for viewer role', () => {
    (usePermissionsHook.usePermissions as jest.Mock).mockReturnValue({
      can: () => false,
      role: 'viewer',
    });

    renderWidget();

    expect(screen.getByText('Ver compartidos')).toBeInTheDocument();
    expect(screen.queryByText('Subir documento')).not.toBeInTheDocument();
  });

  it('shows no actions message when no permissions and not viewer', () => {
    (usePermissionsHook.usePermissions as jest.Mock).mockReturnValue({
      can: () => false,
      role: 'member',
    });

    renderWidget();

    expect(screen.getByText('No hay acciones disponibles.')).toBeInTheDocument();
  });
});
