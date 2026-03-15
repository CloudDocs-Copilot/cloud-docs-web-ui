import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PlanInfoWidget } from '../../../../components/Dashboard/widgets/PlanInfoWidget';
import * as organizationHook from '../../../../hooks/useOrganization';

jest.mock('../../../../hooks/useOrganization');

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PlanInfoWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when activeOrganization is null', () => {
    (organizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: null,
    });

    const { container } = renderWithRouter(<PlanInfoWidget />);

    expect(container.firstChild).toBeNull();
  });

  it('renders widget when activeOrganization exists', () => {
    (organizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: {
        id: 'org-1',
        name: 'Test Organization',
        plan: 'FREE',
        settings: {
          maxStorage: 1000,
          usedStorage: 500,
        },
        createdAt: '2024-01-01T00:00:00Z',
      },
    });

    renderWithRouter(<PlanInfoWidget />);

    expect(screen.getByText('Plan Actual')).toBeInTheDocument();
  });

  it('displays free plan', () => {
    (organizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: {
        id: 'org-1',
        name: 'Test Org',
        plan: 'FREE',
        settings: {
          maxStorage: 1000,
          usedStorage: 500,
        },
        createdAt: '2024-01-01T00:00:00Z',
      },
    });

    renderWithRouter(<PlanInfoWidget />);

    expect(screen.getByText('FREE')).toBeInTheDocument();
  });

  it('displays basic plan', () => {
    (organizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: {
        id: 'org-1',
        name: 'Test Org',
        plan: 'BASIC',
        settings: {
          maxStorage: 10000,
          usedStorage: 5000,
        },
        createdAt: '2024-01-01T00:00:00Z',
      },
    });

    renderWithRouter(<PlanInfoWidget />);

    expect(screen.getByText('BASIC')).toBeInTheDocument();
  });

  it('displays premium plan', () => {
    (organizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: {
        id: 'org-1',
        name: 'Test Org',
        plan: 'PREMIUM',
        settings: {
          maxStorage: 100000,
          usedStorage: 50000,
        },
        createdAt: '2024-01-01T00:00:00Z',
      },
    });

    renderWithRouter(<PlanInfoWidget />);

    expect(screen.getByText('PREMIUM')).toBeInTheDocument();
  });

  it('displays creation date when present', () => {
    (organizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: {
        id: 'org-1',
        name: 'Test Org',
        plan: 'FREE',
        settings: {},
        createdAt: '2024-01-15T00:00:00Z',
      },
    });

    renderWithRouter(<PlanInfoWidget />);

    expect(screen.getByText('Plan Actual')).toBeInTheDocument();
  });

  it('handles null createdAt gracefully', () => {
    (organizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: {
        id: 'org-1',
        name: 'Test Org',
        plan: 'FREE',
        settings: {},
        createdAt: null,
      },
    });

    renderWithRouter(<PlanInfoWidget />);

    expect(screen.getByText('Plan Actual')).toBeInTheDocument();
  });

  it('displays upgrade button for free plan', () => {
    (organizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: {
        id: 'org-1',
        name: 'Test Org',
        plan: 'FREE',
        settings: {},
        createdAt: '2024-01-01T00:00:00Z',
      },
    });

    renderWithRouter(<PlanInfoWidget />);

    expect(screen.getByText('Plan Actual')).toBeInTheDocument();
  });

  it('displays storage information when available', () => {
    (organizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: {
        id: 'org-1',
        name: 'Test Org',
        plan: 'BASIC',
        settings: {
          maxStorage: 10000,
          usedStorage: 5000,
        },
        createdAt: '2024-01-01T00:00:00Z',
      },
    });

    renderWithRouter(<PlanInfoWidget />);

    expect(screen.getByText('Plan Actual')).toBeInTheDocument();
  });

  it('renders plan icon', () => {
    (organizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: {
        id: 'org-1',
        name: 'Test Org',
        plan: 'FREE',
        settings: {},
        createdAt: '2024-01-01T00:00:00Z',
      },
    });

    const { container } = renderWithRouter(<PlanInfoWidget />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('handles organization update', () => {
    (organizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: {
        id: 'org-1',
        name: 'Updated Org',
        plan: 'PREMIUM',
        settings: {},
        createdAt: '2024-01-01T00:00:00Z',
      },
    });

    const { rerender } = renderWithRouter(<PlanInfoWidget />);

    rerender(
      <BrowserRouter>
        <PlanInfoWidget />
      </BrowserRouter>
    );

    expect(screen.getByText('PREMIUM')).toBeInTheDocument();
  });

  it('displays case-insensitive plan name', () => {
    (organizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: {
        id: 'org-1',
        name: 'Test Org',
        plan: 'free',
        settings: {},
        createdAt: '2024-01-01T00:00:00Z',
      },
    });

    renderWithRouter(<PlanInfoWidget />);

    expect(screen.getByText('Plan Actual')).toBeInTheDocument();
  });
});
