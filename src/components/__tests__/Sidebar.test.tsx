import { render, screen, fireEvent } from '@testing-library/react';

// Mock react-router-dom but keep original exports, override useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock hook before importing the component
jest.mock('../../hooks/useOrganization', () => () => ({ activeOrganization: { id: 'org-1', name: 'Org1' } }));

import Sidebar from '../Sidebar';
import { MemoryRouter } from 'react-router-dom';

describe('Sidebar', () => {
  it('renders menu items and organization name and navigates on click', () => {
    render(
      <MemoryRouter>
        <Sidebar activeItem="dashboard" />
      </MemoryRouter>
    );

    expect(screen.getByText('CloudDocs Copilot')).toBeInTheDocument();
    expect(screen.getByText('Org1')).toBeInTheDocument();

    const link = screen.getByText('Dashboard');
    fireEvent.click(link);
    expect(mockNavigate).toHaveBeenCalled();
  });
});
