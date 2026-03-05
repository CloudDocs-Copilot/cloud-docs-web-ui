import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import MainLayout from '../../MainLayout';
import type { PageInfo } from '../../../types/page.types';

interface PageContextType {
  pageInfo: Partial<PageInfo>;
}

interface SidebarProps {
  activeItem?: string;
}

const mockUsePageContext = jest.fn<PageContextType, []>();

// Mock subcomponents and hooks
jest.mock('../../../hooks/usePageContext', () => ({ usePageContext: () => mockUsePageContext() }));
jest.mock('../../Sidebar', () => (props: SidebarProps) => <div data-testid="sidebar">S-{props.activeItem}</div>);
jest.mock('../../Header', () => () => <div data-testid="header">Header</div>);

describe('MainLayout branches', () => {
  beforeEach(() => {
    mockUsePageContext.mockReturnValue({ pageInfo: {} });
  });
  
  afterEach(() => jest.resetAllMocks());

  it('renders children always', () => {
    render(<MemoryRouter><MainLayout><div>child</div></MainLayout></MemoryRouter>);
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('renders page title when provided', () => {
    mockUsePageContext.mockReturnValue({ pageInfo: { title: 'T' } });
    render(<MemoryRouter><MainLayout><div /></MainLayout></MemoryRouter>);
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('renders breadcrumbs when provided', () => {
    mockUsePageContext.mockReturnValue({ pageInfo: { title: 'X', breadcrumbs: [{ label: 'b1' }, { label: 'b2' }] } });
    render(<MemoryRouter><MainLayout><div /></MainLayout></MemoryRouter>);
    expect(screen.getByText('b1')).toBeInTheDocument();
    expect(screen.getByText('b2')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    mockUsePageContext.mockReturnValue({ pageInfo: { title: 'X', actions: <span>act</span> } });
    render(<MemoryRouter><MainLayout><div /></MainLayout></MemoryRouter>);
    expect(screen.getByText('act')).toBeInTheDocument();
  });
});
