import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import MainLayout from '../../MainLayout';
import type { PageInfo } from '../../../types/page.types';
import type { Document } from '../../../types/document.types';

interface PageContextType {
  pageInfo: Partial<PageInfo>;
}

interface SidebarProps {
  activeItem?: string;
}

interface HeaderProps {
  onDocumentsUploaded?: (docs: Document[]) => void;
}

const mockUsePageContext = jest.fn<PageContextType, []>();

// Mock subcomponents and hooks
jest.mock('../../../hooks/usePageContext', () => ({ usePageContext: () => mockUsePageContext() }));
jest.mock('../../Sidebar', () => (props: SidebarProps) => <div data-testid="sidebar">S-{props.activeItem}</div>);
jest.mock('../../Header', () => (props: HeaderProps) => (
  <div>
    <button data-testid="header-upload" onClick={() => props.onDocumentsUploaded && props.onDocumentsUploaded([{ id: 'd1' } as Document])}>upload</button>
  </div>
));

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

  it('passes onDocumentsUploaded to Header and is callable', () => {
    const uploaded: Document[] = [];
    render(<MemoryRouter><MainLayout onDocumentsUploaded={(docs: Document[]) => uploaded.push(...docs)}><div /></MainLayout></MemoryRouter>);
    // header mock provides a button
    const btn = screen.getByTestId('header-upload');
    btn.click();
    expect(uploaded.length).toBeGreaterThan(0);
  });
});
