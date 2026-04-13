import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import api from '../../api/axios';
import { sessionKeys } from '../../constants/sessionKeys';
import { AuthContext } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { useNotifications } from '../../hooks/useNotifications';

const socketIoMock = vi.hoisted(() => vi.fn());

vi.mock('socket.io-client', () => ({
  io: socketIoMock
}));

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn()
  }
}));

function NotificationProbe() {
  const notifications = useNotifications();

  return (
    <div>
      <p data-testid="connected">{notifications.connected ? 'connected' : 'offline'}</p>
      <p data-testid="unread">{String(notifications.unreadCount)}</p>
      <button type="button" onClick={() => notifications.markAsRead(1)}>
        mark one
      </button>
      <button type="button" onClick={() => notifications.markAllAsRead()}>
        mark all
      </button>
      <ul>
        {notifications.notifications.map((notification) => (
          <li key={notification.id}>{`${notification.title} :: ${notification.isRead ? 'read' : 'unread'}`}</li>
        ))}
      </ul>
    </div>
  );
}

function renderNotificationProvider({ auth }) {
  return render(
    <AuthContext.Provider value={auth}>
      <NotificationProvider>
        <NotificationProbe />
      </NotificationProvider>
    </AuthContext.Provider>
  );
}

describe('NotificationProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('loads notifications, joins the user room, and merges realtime events', async () => {
    const socketHandlers = {};
    const emit = vi.fn();
    const disconnect = vi.fn();

    socketIoMock.mockReturnValue({
      on: vi.fn((event, handler) => {
        socketHandlers[event] = handler;
      }),
      emit,
      disconnect
    });

    api.get.mockResolvedValueOnce({
      data: {
        notifications: [
          {
            id: 1,
            title: 'Seeded message',
            type: 'MESSAGE',
            message: 'An author reached out to your inbox.',
            isRead: false,
            createdAt: '2026-04-12T10:00:00.000Z'
          }
        ]
      }
    });

    localStorage.setItem(sessionKeys.accessToken, 'stage-10-token');
    localStorage.setItem(sessionKeys.user, JSON.stringify({ id: 3, role: 'READER', name: 'Nomsa Reader' }));

    renderNotificationProvider({
      auth: {
        user: { id: 3, role: 'READER', name: 'Nomsa Reader' },
        isAuthenticated: true,
        loading: false,
        isReader: true
      }
    });

    expect(await screen.findByText(/seeded message :: unread/i)).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/notifications');
    expect(socketIoMock).toHaveBeenCalled();

    await act(async () => {
      socketHandlers.connect();
    });

    await waitFor(() => {
      expect(screen.getByTestId('connected')).toHaveTextContent('connected');
    });
    expect(emit).toHaveBeenCalledWith('notifications:join', 3);

    await act(async () => {
      socketHandlers['notification:new']({
        id: 9,
        title: 'Live announcement',
        type: 'ANNOUNCEMENT',
        message: 'A new platform announcement just arrived.',
        isRead: false,
        createdAt: '2026-04-13T12:00:00.000Z'
      });
    });

    expect(await screen.findByText(/live announcement :: unread/i)).toBeInTheDocument();
    expect(screen.getByTestId('unread')).toHaveTextContent('2');
  });

  test('markAsRead and markAllAsRead update local notification state', async () => {
    const user = userEvent.setup();

    socketIoMock.mockReturnValue({
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn()
    });

    api.get.mockResolvedValueOnce({
      data: {
        notifications: [
          {
            id: 1,
            title: 'Unread reply',
            type: 'COMMENT_REPLY',
            message: 'A reader replied to your note.',
            isRead: false,
            createdAt: '2026-04-12T08:00:00.000Z'
          },
          {
            id: 2,
            title: 'Unread update',
            type: 'SYSTEM',
            message: 'A system update landed for a featured book.',
            isRead: false,
            createdAt: '2026-04-11T08:00:00.000Z'
          }
        ]
      }
    });

    api.patch.mockResolvedValue({});

    localStorage.setItem(sessionKeys.accessToken, 'stage-10-token');
    localStorage.setItem(sessionKeys.user, JSON.stringify({ id: 3, role: 'READER', name: 'Nomsa Reader' }));

    renderNotificationProvider({
      auth: {
        user: { id: 3, role: 'READER', name: 'Nomsa Reader' },
        isAuthenticated: true,
        loading: false,
        isReader: true
      }
    });

    expect(await screen.findByText(/unread reply :: unread/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /mark one/i }));
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/notifications/1/read');
    });
    expect(screen.getByText(/unread reply :: read/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /mark all/i }));
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/notifications/read-all');
    });
    expect(screen.getByText(/unread update :: read/i)).toBeInTheDocument();
    expect(screen.getByTestId('unread')).toHaveTextContent('0');
  });

  test('stays quiet when there is no stored session to restore', async () => {
    renderNotificationProvider({
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        isReader: false
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('connected')).toHaveTextContent('offline');
    });

    expect(api.get).not.toHaveBeenCalled();
    expect(socketIoMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('unread')).toHaveTextContent('0');
  });
});
