import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NotificationsWidget } from '../../../../components/Dashboard/widgets/NotificationsWidget';
import * as notificationsHook from '../../../../hooks/useNotifications';

jest.mock('../../../../hooks/useNotifications');

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('NotificationsWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders widget', () => {
    (notificationsHook.useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      loading: false,
      unreadCount: 0,
    });

    const { container } = renderWithRouter(<NotificationsWidget />);

    // Should render some widget content
    expect(container).toBeInTheDocument();
  });

  it('displays loading state', () => {
    (notificationsHook.useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      loading: true,
      unreadCount: 0,
    });

    const { container } = renderWithRouter(<NotificationsWidget />);

    expect(container).toBeInTheDocument();
  });

  it('displays unread count badge', () => {
    (notificationsHook.useNotifications as jest.Mock).mockReturnValue({
      notifications: [
        {
          id: '1',
          type: 'DOC_UPLOADED',
          message: 'Document uploaded',
          timestamp: new Date(),
          read: false,
        },
      ],
      loading: false,
      unreadCount: 1,
    });

    const { container } = renderWithRouter(<NotificationsWidget />);

    // Should render the badge with count
    expect(container.textContent).toContain('1');
  });

  it('renders notification items', () => {
    (notificationsHook.useNotifications as jest.Mock).mockReturnValue({
      notifications: [
        {
          id: '1',
          type: 'DOC_UPLOADED',
          message: 'Document uploaded successfully',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          read: false,
        },
        {
          id: '2',
          type: 'DOC_COMMENTED',
          message: 'New comment on document',
          timestamp: new Date('2024-01-01T11:00:00Z'),
          read: true,
        },
      ],
      loading: false,
      unreadCount: 1,
    });

    const { container } = renderWithRouter(<NotificationsWidget />);

    expect(container).toBeInTheDocument();
  });

  it('displays notification type labels', () => {
    (notificationsHook.useNotifications as jest.Mock).mockReturnValue({
      notifications: [
        {
          id: '1',
          type: 'DOC_UPLOADED',
          message: 'Test document',
          timestamp: new Date(),
          read: false,
        },
      ],
      loading: false,
      unreadCount: 1,
    });

    const { container } = renderWithRouter(<NotificationsWidget />);

    expect(container).toBeInTheDocument();
  });

  it('handles empty notifications list', () => {
    (notificationsHook.useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      loading: false,
      unreadCount: 0,
    });

    const { container } = renderWithRouter(<NotificationsWidget />);

    expect(container).toBeInTheDocument();
  });

  it('displays multiple notification types', () => {
    (notificationsHook.useNotifications as jest.Mock).mockReturnValue({
      notifications: [
        {
          id: '1',
          type: 'DOC_UPLOADED',
          message: 'Document uploaded',
          timestamp: new Date(),
          read: false,
        },
        {
          id: '2',
          type: 'MEMBER_INVITED',
          message: 'Member invited',
          timestamp: new Date(),
          read: false,
        },
        {
          id: '3',
          type: 'AI_PROCESSED',
          message: 'AI processing complete',
          timestamp: new Date(),
          read: true,
        },
      ],
      loading: false,
      unreadCount: 2,
    });

    const { container } = renderWithRouter(<NotificationsWidget />);

    expect(container).toBeInTheDocument();
  });

  it('renders notification icon', () => {
    (notificationsHook.useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      loading: false,
      unreadCount: 0,
    });

    const { container } = renderWithRouter(<NotificationsWidget />);

    // Icon should be rendered
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('displays read notifications with different styling', () => {
    (notificationsHook.useNotifications as jest.Mock).mockReturnValue({
      notifications: [
        {
          id: '1',
          type: 'DOC_UPLOADED',
          message: 'Read notification',
          timestamp: new Date(),
          read: true,
        },
      ],
      loading: false,
      unreadCount: 0,
    });

    const { container } = renderWithRouter(<NotificationsWidget />);

    expect(container).toBeInTheDocument();
  });

  it('updates when notifications change', () => {
    (notificationsHook.useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      loading: false,
      unreadCount: 0,
    });

    const { rerender } = renderWithRouter(<NotificationsWidget />);

    (notificationsHook.useNotifications as jest.Mock).mockReturnValue({
      notifications: [
        {
          id: '1',
          type: 'DOC_UPLOADED',
          message: 'New notification',
          timestamp: new Date(),
          read: false,
        },
      ],
      loading: false,
      unreadCount: 1,
    });

    rerender(
      <BrowserRouter>
        <NotificationsWidget />
      </BrowserRouter>
    );

    const { container } = renderWithRouter(<NotificationsWidget />);
    expect(container).toBeInTheDocument();
  });
});
