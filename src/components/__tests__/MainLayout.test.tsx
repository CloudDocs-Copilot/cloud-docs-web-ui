import { render, screen } from '@testing-library/react';
import MainLayout from '../MainLayout';

// Mock Sidebar and Header to keep test focused
jest.mock('../Sidebar', () => () => <div data-testid="mock-sidebar" />);
jest.mock('../Header', () => () => (
  <div data-testid="mock-header">Header</div>
));

jest.mock('../../hooks/usePageContext', () => ({
  usePageContext: () => ({ pageInfo: { title: 'Test Title', subtitle: 'Sub', breadcrumbs: [{ label: 'one' }], actions: <div>act</div> } })
}));

import { MemoryRouter } from 'react-router-dom';

describe('MainLayout', () => {
  it('renders header, sidebar, title, breadcrumbs and children', () => {
    render(
      <MemoryRouter initialEntries={["/collections"]}>
        <MainLayout>
          <div data-testid="child">Child</div>
        </MainLayout>
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
  });
});
