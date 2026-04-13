import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import api from '../../api/axios';
import BookCard from '../../components/books/BookCard';
import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/Navbar';
import Login from '../../pages/Login';
import MyBooks from '../../pages/MyBooks';
import AdminUsers from '../../pages/AdminUsers';
import { renderWithProviders } from '../renderWithProviders';

const authHookMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());
const navigateMock = vi.hoisted(() => vi.fn());
const notificationBellStub = vi.hoisted(() => vi.fn(() => <span>NotificationBell</span>));

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => authHookMock()
}));

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    success: toastSuccessMock,
    error: toastErrorMock
  })
}));

vi.mock('../../components/notifications/NotificationBell', () => ({
  default: notificationBellStub
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: null, pathname: '/login' })
  };
});

function renderInRouter(ui) {
  return render(
    <MemoryRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      {ui}
    </MemoryRouter>
  );
}

describe('UI action coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authHookMock.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      isAuthor: false,
      user: null,
      logout: vi.fn(),
      login: vi.fn()
    });
  });

  test('public navbar links and auth CTAs point to the right destinations', () => {
    renderInRouter(<Navbar />);

    expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /^books$/i })).toHaveAttribute('href', '/books');
    expect(screen.getAllByRole('link', { name: /messages/i })[0]).toHaveAttribute('href', '/messages');
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /create account/i })).toHaveAttribute('href', '/register');
  });

  test('mobile navbar exposes authenticated actions and sign-out control', async () => {
    const user = userEvent.setup();
    const logout = vi.fn();

    authHookMock.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      isAuthor: true,
      user: { id: 1, name: 'Admin Author' },
      logout
    });

    renderInRouter(<Navbar />);

    await user.click(screen.getByRole('button', { name: /open menu/i }));

    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('link', { name: /notifications/i })).toHaveAttribute('href', '/notifications');
    expect(screen.getAllByRole('link', { name: /my books/i })[0]).toHaveAttribute('href', '/my-books');
    expect(screen.getAllByRole('link', { name: /admin/i })[0]).toHaveAttribute('href', '/admin');

    await user.click(screen.getByRole('button', { name: /sign out/i }));
    expect(logout).toHaveBeenCalled();
  });

  test('footer keeps the brand lockup and platform summary visible', () => {
    renderInRouter(<Footer />);

    expect(screen.getByText(/a premium literary platform for discovery, publishing presence, and community/i)).toBeInTheDocument();
    expect(screen.getByText(/built as a scalable platform foundation/i)).toBeInTheDocument();
  });

  test('login form validates inputs, exposes register navigation, and shows pending submit state', async () => {
    const user = userEvent.setup();
    let resolveLogin;

    authHookMock.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      isAuthor: false,
      user: null,
      logout: vi.fn(),
      login: vi.fn(
        () =>
          new Promise((resolve) => {
            resolveLogin = resolve;
          })
      )
    });

    renderInRouter(<Login />);

    await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    expect(await screen.findByText(/please enter your email address/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create one/i })).toHaveAttribute('href', '/register');

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();

    resolveLogin({ user: { id: 3, role: 'READER' } });
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/profile');
    });
  });

  test('book card action buttons and links stay wired correctly', async () => {
    const user = userEvent.setup();
    const onFavorite = vi.fn();

    renderInRouter(
      <BookCard
        onFavorite={onFavorite}
        book={{
          id: 55,
          slug: 'worlds-apart',
          title: 'Worlds Apart',
          shortDescription: 'A luminous literary journey.',
          coverImage: 'https://example.com/worlds-apart.jpg',
          amazonUrl: 'https://amazon.com/worlds-apart',
          genre: 'Fantasy',
          category: 'Fiction',
          isFeatured: true,
          isFavorited: false,
          averageRating: 4.6,
          author: { id: 2, name: 'Amina Dube', role: 'AUTHOR' },
          _count: { favorites: 12, comments: 5 }
        }}
      />
    );

    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute('href', '/books/worlds-apart');
    expect(screen.getByRole('link', { name: /by amina dube/i })).toHaveAttribute('href', '/authors/2');
    expect(screen.getByRole('link', { name: /amazon/i })).toHaveAttribute('href', 'https://amazon.com/worlds-apart');

    await user.click(screen.getByRole('button'));
    expect(onFavorite).toHaveBeenCalledWith(55);
  });

  test('my books page keeps edit, cancel, view, and delete actions working', async () => {
    const user = userEvent.setup();
    let books = [
      {
        id: 91,
        slug: 'ember-garden',
        title: 'Ember Garden',
        genre: 'Fantasy',
        category: 'Novel',
        shortDescription: 'A poetic fantasy grounded in memory.',
        fullDescription: 'Longform description',
        coverImage: 'https://example.com/ember.jpg',
        amazonUrl: 'https://amazon.com/ember',
        isFeatured: false,
        _count: { favorites: 4, comments: 2 }
      }
    ];

    api.get.mockImplementation(async (url) => {
      if (url === '/users/me/books') {
        return { data: { books: structuredClone(books) } };
      }

      return { data: {} };
    });

    api.delete.mockImplementation(async (url) => {
      if (url === '/books/91') {
        books = [];
        return { data: { success: true } };
      }

      return { data: {} };
    });

    renderWithProviders(<MyBooks />, {
      auth: {
        user: { id: 2, role: 'AUTHOR', name: 'Amina Dube' },
        isAuthenticated: true,
        isAuthor: true
      }
    });

    expect(await screen.findByRole('heading', { name: /your published catalog/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view page/i })).toHaveAttribute('href', '/books/ember-garden');

    await user.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByDisplayValue('Ember Garden')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel edit/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel edit/i }));
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /cancel edit/i })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/books/91');
    });
    expect(await screen.findByRole('heading', { name: /no books published yet/i })).toBeInTheDocument();
  });

  test('admin users page keeps feature-author actions interactive', async () => {
    const user = userEvent.setup();
    let users = [
      {
        id: 2,
        name: 'Amina Dube',
        email: 'author@example.com',
        role: 'AUTHOR',
        isFeaturedAuthor: false,
        _count: {
          comments: 9,
          favorites: 12
        }
      }
    ];

    api.get.mockResolvedValue({
      data: {
        users: structuredClone(users)
      }
    });

    api.patch.mockImplementation(async (url) => {
      if (url === '/admin/users/2/feature-author') {
        users = users.map((entry) =>
          entry.id === 2
            ? {
                ...entry,
                isFeaturedAuthor: !entry.isFeaturedAuthor
              }
            : entry
        );

        return {
          data: {
            user: users[0]
          }
        };
      }

      return { data: {} };
    });

    renderWithProviders(<AdminUsers />, {
      auth: {
        user: { id: 1, role: 'ADMIN', name: 'Nova Admin' },
        isAuthenticated: true,
        isAdmin: true
      }
    });

    expect(await screen.findByRole('heading', { name: /see who is shaping the platform/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^feature author$/i }));
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/admin/users/2/feature-author');
    });
    expect(screen.getByRole('button', { name: /^featured author$/i })).toBeInTheDocument();
  });
});
