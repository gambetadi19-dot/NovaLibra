import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Messages from '../../pages/Messages';
import { renderWithProviders } from '../renderWithProviders';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn()
}));

vi.mock('../../api/axios', () => ({
  default: apiMock
}));

describe('Reader messages page', () => {
  let messages;
  let recipients;

  beforeEach(() => {
    vi.clearAllMocks();

    recipients = {
      admin: {
        id: 1,
        name: 'NovaLibra Admin',
        role: 'ADMIN'
      },
      authors: [
        {
          id: 2,
          name: 'Amina Dube',
          role: 'AUTHOR'
        }
      ]
    };

    messages = [
      {
        id: 101,
        senderId: 2,
        receiverId: 3,
        subject: 'Re: Book club invitation',
        content: 'Thank you for the invitation.',
        status: 'UNREAD',
        createdAt: '2026-04-10T10:00:00.000Z',
        sender: { id: 2, name: 'Amina Dube', role: 'AUTHOR' },
        receiver: { id: 3, name: 'Nomsa Reader', role: 'READER' }
      },
      {
        id: 102,
        senderId: 3,
        receiverId: 2,
        subject: 'Book club invitation',
        content: 'Would you be open to a short virtual appearance?',
        status: 'READ',
        createdAt: '2026-04-09T10:00:00.000Z',
        sender: { id: 3, name: 'Nomsa Reader', role: 'READER' },
        receiver: { id: 2, name: 'Amina Dube', role: 'AUTHOR' }
      }
    ];

    apiMock.get.mockImplementation((url) => {
      if (url === '/messages') {
        return Promise.resolve({
          data: {
            messages: structuredClone(messages)
          }
        });
      }

      if (url === '/users/admin-contact') {
        return Promise.resolve({
          data: {
            admin: recipients.admin
          }
        });
      }

      if (url === '/users/authors') {
        return Promise.resolve({
          data: {
            authors: recipients.authors
          }
        });
      }

      return Promise.resolve({ data: {} });
    });

    apiMock.patch.mockImplementation((url) => {
      const match = url.match(/^\/messages\/(\d+)\/read$/);
      if (match) {
        const id = Number(match[1]);
        messages = messages.map((message) =>
          message.id === id
            ? {
                ...message,
                status: 'READ'
              }
            : message
        );

        return Promise.resolve({
          data: {
            message: messages.find((message) => message.id === id)
          }
        });
      }

      return Promise.resolve({ data: {} });
    });

    apiMock.post.mockImplementation((url, body) => {
      if (url === '/messages') {
        const recipient = [recipients.admin, ...recipients.authors].find((entry) => entry.id === body.receiverId);
        const message = {
          id: 103,
          senderId: 3,
          receiverId: body.receiverId,
          subject: body.subject,
          content: body.content,
          status: 'UNREAD',
          createdAt: '2026-04-13T12:00:00.000Z',
          sender: { id: 3, name: 'Nomsa Reader', role: 'READER' },
          receiver: recipient
        };

        messages = [message, ...messages];

        return Promise.resolve({
          data: {
            message
          }
        });
      }

      return Promise.resolve({ data: {} });
    });
  });

  test('reader inbox loads and marks unread incoming messages as read', async () => {
    renderWithProviders(<Messages />, {
      route: '/messages',
      auth: {
        user: { id: 3, name: 'Nomsa Reader', role: 'READER' },
        isAuthenticated: true,
        isReader: true
      }
    });

    expect(await screen.findByRole('heading', { name: /your recent correspondence/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(apiMock.patch).toHaveBeenCalledWith('/messages/101/read');
    });

    expect(screen.getAllByText(/^read$/i).length).toBeGreaterThan(0);
  });

  test('reader can compose and send a new message to an author', async () => {
    const user = userEvent.setup();

    renderWithProviders(<Messages />, {
      route: '/messages',
      auth: {
        user: { id: 3, name: 'Nomsa Reader', role: 'READER' },
        isAuthenticated: true,
        isReader: true
      }
    });

    await screen.findByRole('heading', { name: /start a new note/i });

    await user.selectOptions(screen.getByLabelText(/recipient/i), '2');
    await user.type(screen.getByPlaceholderText(/book feedback, partnership idea/i), 'Reader follow-up');
    await user.type(screen.getByPlaceholderText(/write your message/i), 'This message confirms the reader inbox can send thoughtful outreach to an author.');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith('/messages', {
        receiverId: 2,
        subject: 'Reader follow-up',
        content: 'This message confirms the reader inbox can send thoughtful outreach to an author.'
      });
    });

    expect(await screen.findByRole('heading', { name: /reader follow-up/i })).toBeInTheDocument();
  });
});
