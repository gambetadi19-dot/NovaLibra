import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import AdminAnnouncements from '../../pages/AdminAnnouncements';
import AdminBooks from '../../pages/AdminBooks';
import AdminComments from '../../pages/AdminComments';
import AdminDashboard from '../../pages/AdminDashboard';
import AdminMessages from '../../pages/AdminMessages';
import AdminUsers from '../../pages/AdminUsers';
import { renderWithProviders } from '../renderWithProviders';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn()
}));

vi.mock('../../api/axios', () => ({
  default: apiMock
}));

describe('Admin experience pages', () => {
  let dashboardData;
  let books;
  let users;
  let comments;
  let announcements;
  let messages;

  function resetFixtures() {
    dashboardData = {
      stats: {
        totalUsers: 24,
        totalBooks: 12,
        totalComments: 44,
        unreadNotifications: 7,
        totalMessages: 16,
        totalReviews: 18,
        totalFollowers: 21
      },
      activity: {
        recentUsers: [{ id: 1, name: 'Nomsa Reader', email: 'reader@example.com' }],
        recentComments: [{ id: 2, content: 'A thoughtful comment.', user: { name: 'Nomsa Reader' }, book: { title: 'Moonlit Prose' } }],
        recentMessages: [{ id: 3, subject: 'Support request', sender: { name: 'Nomsa Reader' }, receiver: { name: 'NovaLibra Admin' } }],
        topBooks: [{ id: 4, title: 'Moonlit Prose', authorName: 'Amina Dube', favorites: 10, comments: 4, reviewCount: 3, averageRating: 4.7 }],
        topAuthors: [{ id: 5, name: 'Amina Dube', followerCount: 12, bookCount: 3, engagementScore: 18 }]
      }
    };

    books = [
      {
        id: 201,
        title: 'Moonlit Prose',
        genre: 'Fantasy',
        category: 'Fiction',
        isFeatured: true,
        shortDescription: 'A luminous shelf-ready fantasy.',
        fullDescription: 'A luminous shelf-ready fantasy with enough detail for admin editing coverage.',
        coverImage: 'https://example.com/moonlit-prose.png',
        amazonUrl: 'https://example.com/moonlit-prose',
        author: { id: 2, name: 'Amina Dube' }
      }
    ];

    users = [
      { id: 2, name: 'Amina Dube', email: 'author@example.com', role: 'AUTHOR', isFeaturedAuthor: false, _count: { comments: 2, favorites: 9 } },
      { id: 3, name: 'Nomsa Reader', email: 'reader@example.com', role: 'READER', isFeaturedAuthor: false, _count: { comments: 5, favorites: 4 } }
    ];

    comments = [
      {
        id: 301,
        content: 'This story lingers beautifully.',
        user: { id: 3, name: 'Nomsa Reader' },
        book: { id: 201, title: 'Moonlit Prose' },
        replies: []
      }
    ];

    announcements = [
      {
        id: 401,
        title: 'Spring Reading Salon',
        content: 'Join the platform-wide literary salon this Friday evening.'
      }
    ];

    messages = [
      {
        id: 501,
        senderId: 3,
        receiverId: 1,
        subject: 'Support request',
        content: 'Could the platform team help me update my profile details?',
        status: 'UNREAD',
        createdAt: '2026-04-13T08:00:00.000Z',
        sender: { id: 3, name: 'Nomsa Reader', role: 'READER' },
        receiver: { id: 1, name: 'NovaLibra Admin', role: 'ADMIN' }
      }
    ];
  }

  beforeEach(() => {
    vi.clearAllMocks();
    resetFixtures();

    apiMock.get.mockImplementation((url) => {
      if (url === '/admin/dashboard') {
        return Promise.resolve({ data: structuredClone(dashboardData) });
      }

      if (url === '/books') {
        return Promise.resolve({ data: { books: structuredClone(books) } });
      }

      if (url === '/admin/users') {
        return Promise.resolve({ data: { users: structuredClone(users) } });
      }

      if (url === '/admin/comments') {
        return Promise.resolve({ data: { comments: structuredClone(comments) } });
      }

      if (url === '/announcements') {
        return Promise.resolve({ data: { announcements: structuredClone(announcements) } });
      }

      if (url === '/messages') {
        return Promise.resolve({ data: { messages: structuredClone(messages) } });
      }

      return Promise.resolve({ data: {} });
    });

    apiMock.post.mockImplementation((url, body) => {
      if (url === '/books') {
        const book = {
          id: 202,
          ...body,
          author: { id: 1, name: 'NovaLibra Admin' }
        };
        books = [book, ...books];
        return Promise.resolve({ data: { book } });
      }

      if (url === '/comments/301/replies') {
        comments = comments.map((comment) =>
          comment.id === 301
            ? {
                ...comment,
                replies: [...comment.replies, { id: 302, content: body.content, user: { id: 1, name: 'NovaLibra Admin' } }]
              }
            : comment
        );
        return Promise.resolve({ data: { success: true } });
      }

      if (url === '/announcements') {
        const announcement = { id: 402, ...body };
        announcements = [announcement, ...announcements];
        return Promise.resolve({ data: { announcement } });
      }

      if (url === '/messages') {
        const reply = {
          id: 502,
          senderId: 1,
          receiverId: body.receiverId,
          subject: body.subject,
          content: body.content,
          status: 'READ',
          createdAt: '2026-04-13T12:00:00.000Z',
          sender: { id: 1, name: 'NovaLibra Admin', role: 'ADMIN' },
          receiver: { id: body.receiverId, name: 'Nomsa Reader', role: 'READER' }
        };
        messages = [reply, ...messages];
        return Promise.resolve({ data: { message: reply } });
      }

      return Promise.resolve({ data: {} });
    });

    apiMock.patch.mockImplementation((url, body) => {
      const bookMatch = url.match(/^\/books\/(\d+)$/);
      if (bookMatch) {
        const bookId = Number(bookMatch[1]);
        books = books.map((book) => (book.id === bookId ? { ...book, ...body } : book));
        return Promise.resolve({ data: { book: books.find((book) => book.id === bookId) } });
      }

      const userMatch = url.match(/^\/admin\/users\/(\d+)\/feature-author$/);
      if (userMatch) {
        const userId = Number(userMatch[1]);
        users = users.map((user) => (user.id === userId ? { ...user, isFeaturedAuthor: !user.isFeaturedAuthor } : user));
        return Promise.resolve({ data: { user: users.find((user) => user.id === userId) } });
      }

      const announcementMatch = url.match(/^\/announcements\/(\d+)$/);
      if (announcementMatch) {
        const announcementId = Number(announcementMatch[1]);
        announcements = announcements.map((announcement) => (announcement.id === announcementId ? { ...announcement, ...body } : announcement));
        return Promise.resolve({ data: { announcement: announcements.find((announcement) => announcement.id === announcementId) } });
      }

      const messageMatch = url.match(/^\/messages\/(\d+)\/read$/);
      if (messageMatch) {
        const messageId = Number(messageMatch[1]);
        messages = messages.map((message) => (message.id === messageId ? { ...message, status: 'READ' } : message));
        return Promise.resolve({ data: { message: messages.find((message) => message.id === messageId) } });
      }

      return Promise.resolve({ data: {} });
    });

    apiMock.delete.mockImplementation((url) => {
      const bookMatch = url.match(/^\/books\/(\d+)$/);
      if (bookMatch) {
        const bookId = Number(bookMatch[1]);
        books = books.filter((book) => book.id !== bookId);
        return Promise.resolve({ data: { success: true } });
      }

      const announcementMatch = url.match(/^\/announcements\/(\d+)$/);
      if (announcementMatch) {
        const announcementId = Number(announcementMatch[1]);
        announcements = announcements.filter((announcement) => announcement.id !== announcementId);
        return Promise.resolve({ data: { success: true } });
      }

      const commentMatch = url.match(/^\/comments\/(\d+)$/);
      if (commentMatch) {
        const commentId = Number(commentMatch[1]);
        comments = comments.filter((comment) => comment.id !== commentId);
        return Promise.resolve({ data: { success: true } });
      }

      return Promise.resolve({ data: { success: true } });
    });
  });

  test('admin dashboard renders stats and quick actions', async () => {
    renderWithProviders(<AdminDashboard />, {
      auth: {
        user: { id: 1, name: 'NovaLibra Admin', role: 'ADMIN' },
        isAuthenticated: true,
        isAdmin: true
      }
    });

    expect(await screen.findByRole('heading', { name: /run novalibra from a calmer, more premium control room/i })).toBeInTheDocument();
    expect(screen.getAllByText('24').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /manage books/i })).toBeInTheDocument();
    expect(screen.getByText(/support request/i)).toBeInTheDocument();
  });

  test('admin books page supports create, edit, and delete flows', { timeout: 15000 }, async () => {
    const user = userEvent.setup();

    renderWithProviders(<AdminBooks />, {
      auth: {
        user: { id: 1, name: 'NovaLibra Admin', role: 'ADMIN' },
        isAuthenticated: true,
        isAdmin: true
      }
    });

    expect(await screen.findByRole('heading', { name: /add a new book to the catalog/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^title$/i), 'Admin Shelf Feature');
    await user.type(screen.getByLabelText(/short description/i), 'A short admin-facing description for catalog testing.');
    await user.type(
      screen.getByLabelText(/full description/i),
      'A full admin-facing description for catalog testing that is comfortably long enough to satisfy validation.'
    );
    await user.type(screen.getByLabelText(/cover image url/i), 'https://example.com/admin-shelf-feature.png');
    await user.type(screen.getByLabelText(/amazon url/i), 'https://example.com/admin-shelf-feature');
    await user.click(screen.getByLabelText(/feature this book in discovery sections/i));
    await user.click(screen.getByRole('button', { name: /create book/i }));

    const createdTitleNodes = await screen.findAllByText(/^Admin Shelf Feature$/i);
    expect(createdTitleNodes.length).toBeGreaterThan(0);

    const createdCard = createdTitleNodes[0].closest('article');
    await user.click(within(createdCard).getByRole('button', { name: /edit/i }));

    const titleField = screen.getByLabelText(/^title$/i);
    await user.clear(titleField);
    await user.type(titleField, 'Admin Shelf Feature Revised');
    await user.click(screen.getByRole('button', { name: /update book/i }));

    const updatedTitleNodes = await screen.findAllByText(/^Admin Shelf Feature Revised$/i);
    expect(updatedTitleNodes.length).toBeGreaterThan(0);

    const updatedCard = updatedTitleNodes[0].closest('article');
    await user.click(within(updatedCard).getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.queryByText(/^Admin Shelf Feature Revised$/i)).not.toBeInTheDocument();
    });
  });

  test('admin users page can feature an author', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AdminUsers />, {
      auth: {
        user: { id: 1, name: 'NovaLibra Admin', role: 'ADMIN' },
        isAuthenticated: true,
        isAdmin: true
      }
    });

    expect(await screen.findByRole('heading', { name: /see who is shaping the platform/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^feature author$/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^featured author$/i })).toBeInTheDocument();
    });
  });

  test('admin comments page can reply and delete a moderated comment', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AdminComments />, {
      auth: {
        user: { id: 1, name: 'NovaLibra Admin', role: 'ADMIN' },
        isAuthenticated: true,
        isAdmin: true
      }
    });

    expect(await screen.findByRole('heading', { name: /guide community conversation without losing the premium feel/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^reply$/i }));
    await user.type(screen.getByLabelText(/author reply/i), 'Thank you for reading so closely.');
    await user.click(screen.getByRole('button', { name: /post reply/i }));

    expect(await screen.findByText(/thank you for reading so closely/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(screen.queryByText(/this story lingers beautifully/i)).not.toBeInTheDocument();
    });
  });

  test('admin announcements page supports publish, edit, and delete', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AdminAnnouncements />, {
      auth: {
        user: { id: 1, name: 'NovaLibra Admin', role: 'ADMIN' },
        isAuthenticated: true,
        isAdmin: true
      }
    });

    expect(await screen.findByRole('heading', { name: /publish a new announcement/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^title$/i), 'Autumn Salon');
    await user.type(screen.getByLabelText(/^content$/i), 'The Autumn Salon is now open for member reservations and featured readings.');
    await user.click(screen.getByRole('button', { name: /^publish$/i }));

    expect(await screen.findByRole('heading', { name: /autumn salon/i })).toBeInTheDocument();

    const createdCard = screen.getByRole('heading', { name: /autumn salon/i }).closest('article');
    await user.click(within(createdCard).getByRole('button', { name: /^edit$/i }));

    const titleField = screen.getByLabelText(/^title$/i);
    await user.clear(titleField);
    await user.type(titleField, 'Autumn Salon Updated');
    await user.click(screen.getByRole('button', { name: /^update$/i }));

    expect(await screen.findByRole('heading', { name: /autumn salon updated/i })).toBeInTheDocument();

    const updatedCard = screen.getByRole('heading', { name: /autumn salon updated/i }).closest('article');
    await user.click(within(updatedCard).getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /autumn salon updated/i })).not.toBeInTheDocument();
    });
  });

  test('admin messages page marks unread messages read and supports replies', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AdminMessages />, {
      route: '/admin/messages?messageId=501',
      auth: {
        user: { id: 1, name: 'NovaLibra Admin', role: 'ADMIN' },
        isAuthenticated: true,
        isAdmin: true
      }
    });

    expect(await screen.findByRole('heading', { name: /review platform messages from a more composed support desk/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(apiMock.patch).toHaveBeenCalledWith('/messages/501/read');
    });

    await user.click(screen.getByRole('button', { name: /reply to nomsa reader/i }));
    await user.type(screen.getByPlaceholderText(/book feedback, partnership idea/i), 'Support follow-up');
    await user.type(
      screen.getByPlaceholderText(/write your message/i),
      'We have updated your request and the admin inbox reply flow is working as expected.'
    );
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith('/messages', {
        receiverId: 3,
        subject: 'Support follow-up',
        content: 'We have updated your request and the admin inbox reply flow is working as expected.'
      });
    });

    expect(await screen.findByRole('heading', { name: /support follow-up/i })).toBeInTheDocument();
  });
});
