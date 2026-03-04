import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { StorageWidget } from '../Dashboard/StorageWidget';
import { DocumentStatsWidget } from '../Dashboard/DocumentStatsWidget';
import { MemberStatsWidget } from '../Dashboard/MemberStatsWidget';
import { RecentActivityWidget } from '../Dashboard/RecentActivityWidget';
import { QuickActionsWidget } from '../Dashboard/QuickActionsWidget';
import type { StorageStats, MemberStats } from '../../types/dashboard.types';
import type { NotificationDTO } from '../../types/notification.types';

const mockStorage: StorageStats = {
  used: 1073741824,
  total: 10737418240,
  percentage: 10,
  formattedUsed: '1 GB',
  formattedTotal: '10 GB',
};

const mockStorageHigh: StorageStats = {
  used: 8589934592,
  total: 10737418240,
  percentage: 80,
  formattedUsed: '8 GB',
  formattedTotal: '10 GB',
};

const mockStorageCritical: StorageStats = {
  used: 9663676416,
  total: 10737418240,
  percentage: 95,
  formattedUsed: '9 GB',
  formattedTotal: '10 GB',
};

const mockMembers: MemberStats = {
  total: 5,
  active: 4,
  pending: 1,
  byRole: { owner: 1, admin: 1, member: 2, viewer: 1 },
};

const mockNotifications: NotificationDTO[] = [
  {
    id: 'n1',
    organization: 'org-1',
    recipient: 'user-1',
    actor: 'user-2',
    type: 'DOC_UPLOADED',
    entity: { kind: 'document', id: 'doc-1' },
    message: 'Documento subido',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'n2',
    organization: 'org-1',
    recipient: 'user-1',
    actor: 'user-3',
    type: 'MEMBER_JOINED',
    entity: { kind: 'member', id: 'member-1' },
    message: 'Nuevo miembro',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

// ── StorageWidget ────────────────────────────────────────────────────────────

describe('StorageWidget', () => {
  it('renders title', () => {
    render(<StorageWidget storageStats={null} loading={false} error={null} />);
    expect(screen.getByText('Almacenamiento')).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    render(<StorageWidget storageStats={null} loading={true} error={null} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message when error is set', () => {
    render(
      <StorageWidget storageStats={null} loading={false} error="Error de carga" />,
    );
    expect(screen.getByText('Error de carga')).toBeInTheDocument();
  });

  it('renders storage data with formatted values', () => {
    render(
      <StorageWidget storageStats={mockStorage} loading={false} error={null} />,
    );
    expect(screen.getByText(/1 GB de 10 GB utilizados/)).toBeInTheDocument();
  });

  it('shows empty state when no storageStats provided', () => {
    render(<StorageWidget storageStats={null} loading={false} error={null} />);
    expect(screen.getByText('Sin datos de almacenamiento')).toBeInTheDocument();
  });

  it('uses success variant for low usage (<70%)', () => {
    const { container } = render(
      <StorageWidget storageStats={mockStorage} loading={false} error={null} />,
    );
    expect(container.querySelector('.bg-success')).toBeInTheDocument();
  });

  it('uses warning variant for medium usage (70-90%)', () => {
    const { container } = render(
      <StorageWidget storageStats={mockStorageHigh} loading={false} error={null} />,
    );
    expect(container.querySelector('.bg-warning')).toBeInTheDocument();
  });

  it('uses danger variant for high usage (>=90%)', () => {
    const { container } = render(
      <StorageWidget storageStats={mockStorageCritical} loading={false} error={null} />,
    );
    expect(container.querySelector('.bg-danger')).toBeInTheDocument();
  });
});

// ── DocumentStatsWidget ──────────────────────────────────────────────────────

describe('DocumentStatsWidget', () => {
  it('renders title', () => {
    render(<DocumentStatsWidget totalDocuments={0} loading={false} error={null} />);
    expect(screen.getByText('Documentos')).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    render(<DocumentStatsWidget totalDocuments={0} loading={true} error={null} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message when error is set', () => {
    render(
      <DocumentStatsWidget totalDocuments={0} loading={false} error="Error" />,
    );
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders total document count', () => {
    render(
      <DocumentStatsWidget totalDocuments={42} loading={false} error={null} />,
    );
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('documentos totales')).toBeInTheDocument();
  });
});

// ── MemberStatsWidget ────────────────────────────────────────────────────────

describe('MemberStatsWidget', () => {
  it('renders title', () => {
    render(<MemberStatsWidget memberStats={null} loading={false} error={null} />);
    expect(screen.getAllByText('Miembros').length).toBeGreaterThan(0);
  });

  it('shows spinner when loading', () => {
    render(<MemberStatsWidget memberStats={null} loading={true} error={null} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message when error is set', () => {
    render(
      <MemberStatsWidget memberStats={null} loading={false} error="Error miembros" />,
    );
    expect(screen.getByText('Error miembros')).toBeInTheDocument();
  });

  it('renders member count and role breakdown', () => {
    render(
      <MemberStatsWidget memberStats={mockMembers} loading={false} error={null} />,
    );
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('miembros totales')).toBeInTheDocument();
    expect(screen.getByText('Propietarios')).toBeInTheDocument();
    expect(screen.getByText('Administradores')).toBeInTheDocument();
    expect(screen.getAllByText('Miembros').length).toBeGreaterThan(0);
    expect(screen.getByText('Visualizadores')).toBeInTheDocument();
  });

  it('shows empty state when no memberStats', () => {
    render(<MemberStatsWidget memberStats={null} loading={false} error={null} />);
    expect(screen.getByText('Sin datos de miembros')).toBeInTheDocument();
  });
});

// ── RecentActivityWidget ─────────────────────────────────────────────────────

describe('RecentActivityWidget', () => {
  it('renders title', () => {
    render(
      <RecentActivityWidget notifications={[]} loading={false} error={null} />,
    );
    expect(screen.getByText('Actividad Reciente')).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    render(
      <RecentActivityWidget notifications={[]} loading={true} error={null} />,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message when error is set', () => {
    render(
      <RecentActivityWidget
        notifications={[]}
        loading={false}
        error="Error actividad"
      />,
    );
    expect(screen.getByText('Error actividad')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    render(
      <RecentActivityWidget notifications={[]} loading={false} error={null} />,
    );
    expect(screen.getByText('No hay actividad reciente.')).toBeInTheDocument();
  });

  it('renders notification messages', () => {
    render(
      <RecentActivityWidget
        notifications={mockNotifications}
        loading={false}
        error={null}
      />,
    );
    expect(screen.getByText('Documento subido')).toBeInTheDocument();
    expect(screen.getByText('Nuevo miembro')).toBeInTheDocument();
  });
});

// ── QuickActionsWidget ───────────────────────────────────────────────────────

describe('QuickActionsWidget', () => {
  it('renders title', () => {
    render(
      <BrowserRouter>
        <QuickActionsWidget canUpload={false} canInvite={false} />
      </BrowserRouter>,
    );
    expect(screen.getByText(/Acciones Rápidas/)).toBeInTheDocument();
  });

  it('shows upload button when canUpload is true', () => {
    render(
      <BrowserRouter>
        <QuickActionsWidget canUpload={true} canInvite={false} />
      </BrowserRouter>,
    );
    expect(
      screen.getByRole('button', { name: /Subir documento/i }),
    ).toBeInTheDocument();
  });

  it('hides upload button when canUpload is false', () => {
    render(
      <BrowserRouter>
        <QuickActionsWidget canUpload={false} canInvite={false} />
      </BrowserRouter>,
    );
    expect(
      screen.queryByRole('button', { name: /Subir documento/i }),
    ).not.toBeInTheDocument();
  });

  it('shows invite button when canInvite is true', () => {
    render(
      <BrowserRouter>
        <QuickActionsWidget canUpload={false} canInvite={true} />
      </BrowserRouter>,
    );
    expect(
      screen.getByRole('button', { name: /Invitar miembro/i }),
    ).toBeInTheDocument();
  });

  it('hides invite button when canInvite is false', () => {
    render(
      <BrowserRouter>
        <QuickActionsWidget canUpload={false} canInvite={false} />
      </BrowserRouter>,
    );
    expect(
      screen.queryByRole('button', { name: /Invitar miembro/i }),
    ).not.toBeInTheDocument();
  });

  it('always shows settings button', () => {
    render(
      <BrowserRouter>
        <QuickActionsWidget canUpload={false} canInvite={false} />
      </BrowserRouter>,
    );
    expect(
      screen.getByRole('button', { name: /Configuración/i }),
    ).toBeInTheDocument();
  });
});
