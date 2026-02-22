import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StorageWidget } from '../widgets/StorageWidget';
import type { OrgStats } from '../../../types/dashboard.types';

const mockStats: OrgStats = {
  storage: {
    used: 500 * 1024 * 1024, // 500 MB
    total: 1024 * 1024 * 1024, // 1 GB
    percentage: 49,
    formattedUsed: '500 MB',
    formattedTotal: '1 GB',
  },
  members: {
    total: 5,
    active: 4,
    pending: 1,
    byRole: { owner: 1, admin: 1, member: 2, viewer: 1 },
  },
};

describe('StorageWidget', () => {
  it('renders storage used and total', () => {
    render(<StorageWidget stats={mockStats} loading={false} error={null} />);

    const percentTexts = screen.getAllByText('49%');
    expect(percentTexts.length).toBeGreaterThan(0);
  });

  it('shows warning alert when usage > 80%', () => {
    const highUsageStats: OrgStats = {
      ...mockStats,
      storage: {
        ...mockStats.storage,
        used: 850 * 1024 * 1024, // 850 MB of 1 GB = ~83%
      },
    };

    render(<StorageWidget stats={highUsageStats} loading={false} error={null} />);

    expect(screen.getByText(/Más del 80%/)).toBeInTheDocument();
  });

  it('shows danger alert when usage > 95%', () => {
    const criticalStats: OrgStats = {
      ...mockStats,
      storage: {
        ...mockStats.storage,
        used: 980 * 1024 * 1024, // 980 MB of 1 GB = ~96%
      },
    };

    render(<StorageWidget stats={criticalStats} loading={false} error={null} />);

    expect(screen.getByText(/Almacenamiento casi lleno/)).toBeInTheDocument();
  });

  it('shows loading skeleton when loading=true', () => {
    const { container } = render(<StorageWidget stats={null} loading={true} error={null} />);

    const placeholders = container.querySelectorAll('.placeholder');
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it('shows error message when error is provided', () => {
    render(<StorageWidget stats={null} loading={false} error="No se pudieron cargar las estadísticas" />);

    expect(screen.getByText('No se pudieron cargar las estadísticas')).toBeInTheDocument();
  });

  it('shows no data message when stats is null and not loading', () => {
    render(<StorageWidget stats={null} loading={false} error={null} />);

    expect(screen.getByText('No hay datos disponibles.')).toBeInTheDocument();
  });
});
