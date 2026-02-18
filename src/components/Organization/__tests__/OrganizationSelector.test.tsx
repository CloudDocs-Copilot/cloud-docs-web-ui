import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// mock hook default export
jest.mock('../../../hooks/useOrganization', () => ({ __esModule: true, default: jest.fn() }));
import useOrganization from '../../../hooks/useOrganization';
const useOrganizationMock = useOrganization as jest.Mock;

import OrganizationSelector from '../OrganizationSelector';

describe('OrganizationSelector', () => {
  afterEach(() => jest.resetAllMocks());

  it('shows spinner when loading with no active org', () => {
    useOrganizationMock.mockReturnValue({ organizations: [], activeOrganization: null, loading: true, setActiveOrganization: jest.fn() });
    const { container } = render(<OrganizationSelector />);
    expect(container.querySelector('.spinner-border')).toBeInTheDocument();
  });

  it('disables select when no organizations', () => {
    useOrganizationMock.mockReturnValue({ organizations: [], activeOrganization: null, loading: false, setActiveOrganization: jest.fn() });
    render(<OrganizationSelector />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders active organization even if not in list', () => {
    useOrganizationMock.mockReturnValue({
      organizations: [{ id: 'a', name: 'A' }],
      activeOrganization: { id: 'x', name: 'X' },
      loading: false,
      setActiveOrganization: jest.fn()
    });
    render(<OrganizationSelector />);
    expect(screen.getByRole('option', { name: 'X' })).toBeInTheDocument();
  });

  it('calls setActiveOrganization on change', async () => {
    const setActive = jest.fn().mockResolvedValue(undefined);
    useOrganizationMock.mockReturnValue({ organizations: [{ id: 'a', name: 'A' }], activeOrganization: { id: 'a', name: 'A' }, loading: false, setActiveOrganization: setActive });
    render(<OrganizationSelector />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } });
    await waitFor(() => expect(setActive).toHaveBeenCalledWith('a'));
  });
});
