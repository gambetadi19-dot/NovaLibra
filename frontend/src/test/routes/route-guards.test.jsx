import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../../App';
import { renderWithProviders } from '../renderWithProviders';

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/users/me/books') {
        return Promise.resolve({
          data: {
            books: []
          }
        });
      }

      if (url === '/users/me/analytics') {
        return Promise.resolve({
          data: {
            analytics: {
              followerCount: 2,
              totalBooks: 3,
              totalFavorites: 4,
              totalComments: 5,
              totalReviews: 2,
              averageRating: 4.5,
              topBooks: []
            }
          }
        });
      }

      if (url === '/admin/dashboard') {
        return Promise.resolve({
          data: {
            stats: {
              totalUsers: 4,
              totalBooks: 3,
              unreadNotifications: 1,
              totalMessages: 2,
              totalComments: 3,
              totalReviews: 2,
              totalFollowers: 1
            },
            activity: {
              recentUsers: [
                {
                  id: 1,
                  name: 'Nova Reader',
                  email: 'reader@example.com'
                }
              ],
              recentComments: [
                {
                  id: 1,
                  content: 'Loved this book.',
                  user: { name: 'Nova Reader' },
                  book: { title: 'Worlds Apart' }
                }
              ],
              recentMessages: [
                {
                  id: 1,
                  subject: 'Book club',
                  sender: { name: 'Nova Reader' },
                  receiver: { name: 'Amina Dube' }
                }
              ],
              topBooks: [
                {
                  id: 1,
                  title: 'Worlds Apart',
                  authorName: 'Amina Dube',
                  favorites: 2,
                  comments: 1,
                  reviewCount: 1,
                  averageRating: 5
                }
              ],
              topAuthors: [
                {
                  id: 2,
                  name: 'Amina Dube',
                  followerCount: 2,
                  bookCount: 3,
                  engagementScore: 6
                }
              ]
            }
          }
        });
      }

      if (url === '/books') {
        return Promise.resolve({
          data: {
            books: [],
            discovery: {
              genres: [],
              categories: []
            }
          }
        });
      }

      if (url === '/users/authors?featured=true') {
        return Promise.resolve({
          data: {
            authors: []
          }
        });
      }

      if (url === '/announcements') {
        return Promise.resolve({
          data: {
            announcements: []
          }
        });
      }

      return Promise.resolve({ data: {} });
    })
  }
}));

describe('Route guard coverage', () => {
  test('unauthenticated users are redirected to login for protected profile routes', async () => {
    renderWithProviders(<App />, { route: '/profile' });

    expect(await screen.findByRole('heading', { name: /sign in to your novalibra account/i })).toBeInTheDocument();
  });

  test('unauthenticated users are redirected to login for admin routes', async () => {
    renderWithProviders(<App />, { route: '/admin' });

    expect(await screen.findByRole('heading', { name: /sign in to your novalibra account/i })).toBeInTheDocument();
  });

  test('readers are redirected away from author-only routes', async () => {
    renderWithProviders(<App />, {
      route: '/my-books',
      auth: {
        user: { id: 3, name: 'Reader', role: 'READER' },
        isAuthenticated: true,
        isReader: true
      }
    });

    expect(await screen.findByRole('heading', { name: /a literary home/i })).toBeInTheDocument();
  });

  test('authors can access author-only routes', async () => {
    renderWithProviders(<App />, {
      route: '/my-books',
      auth: {
        user: { id: 2, name: 'Author', role: 'AUTHOR' },
        isAuthenticated: true,
        isAuthor: true
      }
    });

    expect(await screen.findByRole('heading', { name: /publish a new title/i })).toBeInTheDocument();
  });

  test('authors are redirected away from admin routes', async () => {
    renderWithProviders(<App />, {
      route: '/admin',
      auth: {
        user: { id: 2, name: 'Author', role: 'AUTHOR' },
        isAuthenticated: true,
        isAuthor: true
      }
    });

    expect(await screen.findByRole('heading', { name: /a literary home/i })).toBeInTheDocument();
  });

  test('admins can access admin routes', async () => {
    renderWithProviders(<App />, {
      route: '/admin',
      auth: {
        user: { id: 1, name: 'Admin', role: 'ADMIN' },
        isAuthenticated: true,
        isAdmin: true
      }
    });

    expect(await screen.findByRole('heading', { name: /run novalibra from a calmer, more premium control room/i })).toBeInTheDocument();
  });
});
