import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Notifications from '../../pages/Notifications';
import { renderWithProviders } from '../renderWithProviders';

const notificationHooks = vi.hoisted(() => ({
  useNotifications: vi.fn(),
  useNotificationNavigation: vi.fn()
}));

vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: notificationHooks.useNotifications
}));

vi.mock('../../hooks/useNotificationNavigation', () => ({
  useNotificationNavigation: notificationHooks.useNotificationNavigation
}));

describe('Reader notifications page', () => {
  test('reader can review notifications and open one with mark-as-read support', async () => {
    const user = userEvent.setup();
    const markAsRead = vi.fn().mockResolvedValue(undefined);
    const markAllAsRead = vi.fn().mockResolvedValue(undefined);
    const openNotification = vi.fn().mockImplementation(async (_notification, options) => {
      await options.onMarkedRead();
    });

    notificationHooks.useNotifications.mockReturnValue({
      notifications: [
        {
          id: 1,
          type: 'MESSAGE',
          title: 'New message received',
          message: 'Amina Dube sent you a message for the author: Book club invitation',
          isRead: false,
          createdAt: '2026-04-10T10:00:00.000Z'
        }
      ],
      unreadCount: 1,
      connected: true,
      loading: false,
      error: '',
      markAsRead,
      markAllAsRead
    });
    notificationHooks.useNotificationNavigation.mockReturnValue({
      openNotification
    });

    renderWithProviders(<Notifications />, {
      auth: {
        user: { id: 3, role: 'READER' },
        isAuthenticated: true,
        isReader: true
      }
    });

    expect(await screen.findByRole('heading', { name: /realtime updates, presented with more calm and signal/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /mark all as read/i }));
    expect(markAllAsRead).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /new message received/i }));

    expect(openNotification).toHaveBeenCalled();
    expect(markAsRead).toHaveBeenCalledWith(1);
  });

  test('reader sees a calm empty state when there are no notifications', async () => {
    notificationHooks.useNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      connected: false,
      loading: false,
      error: '',
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn()
    });
    notificationHooks.useNotificationNavigation.mockReturnValue({
      openNotification: vi.fn()
    });

    renderWithProviders(<Notifications />, {
      auth: {
        user: { id: 3, role: 'READER' },
        isAuthenticated: true,
        isReader: true
      }
    });

    expect(await screen.findByRole('heading', { name: /no notifications yet/i })).toBeInTheDocument();
    expect(screen.getByText(/notifications from replies, announcements, and messages will appear here/i)).toBeInTheDocument();
  });
});
