import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import api from '../../api/axios';
import { useNotificationNavigation } from '../../hooks/useNotificationNavigation';
import { renderWithProviders } from '../renderWithProviders';

const navigateMock = vi.hoisted(() => vi.fn());
const toastInfoMock = vi.hoisted(() => vi.fn());
const authHookMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn()
  }
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => authHookMock()
}));

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    info: toastInfoMock
  })
}));

function NotificationNavigationProbe({ notification }) {
  const { openNotification } = useNotificationNavigation();

  return (
    <button
      type="button"
      onClick={() =>
        openNotification(notification, {
          onMarkedRead: async () => {}
        })
      }
    >
      open notification
    </button>
  );
}

describe('useNotificationNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authHookMock.mockReturnValue({
      user: { id: 3, role: 'READER' }
    });
  });

  test('opens an announcement notification on the matching homepage card', async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValueOnce({
      data: {
        announcements: [
          {
            id: 7,
            title: 'Festival appearance announced',
            content: 'NovaLibra will host a live literary salon next week.'
          }
        ]
      }
    });

    renderWithProviders(
      <NotificationNavigationProbe
        notification={{
          type: 'ANNOUNCEMENT',
          title: 'Festival appearance announced',
          message: 'NovaLibra will host a live literary salon next week.'
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: /open notification/i }));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/announcements');
      expect(navigateMock).toHaveBeenCalledWith('/?announcement=7#announcements');
    });
  });

  test('opens a message notification on the matched inbox thread', async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValueOnce({
      data: {
        messages: [
          {
            id: 22,
            subject: 'Book club invitation',
            sender: { name: 'Amina Dube' },
            senderId: 2,
            receiverId: 3
          }
        ]
      }
    });

    renderWithProviders(
      <NotificationNavigationProbe
        notification={{
          type: 'MESSAGE',
          title: 'New message received',
          message: 'Amina Dube sent you a message for the author: Book club invitation'
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: /open notification/i }));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/messages');
      expect(navigateMock).toHaveBeenCalledWith('/messages?messageId=22');
    });
  });

  test('falls back to the closest view when direct message resolution fails', async () => {
    const user = userEvent.setup();
    api.get.mockRejectedValueOnce(new Error('network drift'));

    renderWithProviders(
      <NotificationNavigationProbe
        notification={{
          type: 'MESSAGE',
          title: 'New message received',
          message: 'Amina Dube sent you a message for the author: Missing thread'
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: /open notification/i }));

    await waitFor(() => {
      expect(toastInfoMock).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith('/messages');
    });
  });
});
