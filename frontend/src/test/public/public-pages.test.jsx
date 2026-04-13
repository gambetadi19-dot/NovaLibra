import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../../App';
import { renderWithProviders } from '../renderWithProviders';

const featuredBook = {
  id: 1,
  slug: 'worlds-apart',
  title: 'Worlds Apart',
  shortDescription: 'A layered story of fracture, memory, and the quiet ache of divided loyalties.',
  fullDescription:
    'Set against a richly textured African social landscape, Worlds Apart explores family loyalty, grief, betrayal, and the emotional cost of silence.',
  coverImage: 'https://placehold.co/640x900/1d4ed8/f8fafc?text=Worlds+Apart',
  amazonUrl: 'https://www.amazon.com/',
  genre: 'Literary Fiction',
  category: 'Family Sagas',
  isFeatured: true,
  isFavorited: false,
  averageRating: 5,
  reviewCount: 1,
  currentUserReview: null,
  _count: { favorites: 2, comments: 1, reviews: 1, books: 1, authorFollowers: 2 },
  author: {
    id: 2,
    name: 'Amina Dube',
    role: 'AUTHOR',
    bio: 'A novelist building a literary presence through layered fiction and reflective essays.',
    websiteUrl: 'https://novalibra.example/amina-dube',
    createdAt: '2026-04-01T10:00:00.000Z'
  },
  comments: []
};

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/books') {
        return Promise.resolve({
          data: {
            books: [
              featuredBook,
              {
                ...featuredBook,
                id: 2,
                slug: 'the-first-cut',
                title: 'The First Cut',
                genre: 'Romance',
                category: 'Campus Stories',
                isFeatured: false
              }
            ],
            discovery: {
              genres: ['Literary Fiction', 'Romance'],
              categories: ['Family Sagas', 'Campus Stories']
            }
          }
        });
      }

      if (url === '/books/worlds-apart') {
        return Promise.resolve({
          data: {
            book: featuredBook
          }
        });
      }

      if (url === '/users/authors?featured=true') {
        return Promise.resolve({
          data: {
            authors: [
              {
                id: 2,
                name: 'Amina Dube',
                bio: featuredBook.author.bio,
                role: 'AUTHOR',
                websiteUrl: featuredBook.author.websiteUrl,
                _count: { books: 2, authorFollowers: 2 }
              }
            ]
          }
        });
      }

      if (url === '/announcements') {
        return Promise.resolve({
          data: {
            announcements: [
              {
                id: 1,
                title: 'New Reader Community Launch',
                content: 'The NovaLibra literary platform is now live.'
              }
            ]
          }
        });
      }

      if (url === '/users/authors/2') {
        return Promise.resolve({
          data: {
            author: {
              ...featuredBook.author,
              isFollowing: false,
              books: [featuredBook],
              _count: { books: 1, authorFollowers: 2 }
            }
          }
        });
      }

      if (url === '/users/authors/999') {
        return Promise.reject({
          response: {
            data: {
              message: 'Author not found'
            }
          }
        });
      }

      if (url === '/books/missing-book') {
        return Promise.reject({
          response: {
            data: {
              message: 'Book not found'
            }
          }
        });
      }

      return Promise.resolve({ data: {} });
    }),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}));

describe('Public visitor experience', () => {
  test('homepage renders public navigation and primary CTAs', async () => {
    renderWithProviders(<App />, { route: '/' });

    expect(await screen.findByRole('heading', { name: /a literary home/i })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation')).getByRole('link', { name: /^home$/i })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation')).getByRole('link', { name: /^books$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /create account/i }).length).toBeGreaterThan(0);
  });

  test('homepage CTA navigates to the books page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: '/' });

    await user.click(await screen.findByRole('link', { name: /explore books/i }));

    expect(await screen.findByRole('heading', { name: /browse a catalog designed to feel guided, not crowded/i })).toBeInTheDocument();
  });

  test('books page shows public cards and details links', async () => {
    renderWithProviders(<App />, { route: '/books' });

    expect(await screen.findByRole('heading', { name: /browse a catalog designed to feel guided, not crowded/i })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /worlds apart/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /view details/i }).length).toBeGreaterThan(0);
  });

  test('book details page renders public content and author link', async () => {
    renderWithProviders(<App />, { route: '/books/worlds-apart' });

    expect(await screen.findByRole('heading', { name: /worlds apart/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /by amina dube/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /buy on amazon/i })).toBeInTheDocument();
  });

  test('author profile page renders public catalog information', async () => {
    renderWithProviders(<App />, { route: '/authors/2' });

    expect(await screen.findByRole('heading', { level: 1, name: /^amina dube$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /books by amina dube/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /worlds apart/i })).toBeInTheDocument();
  });

  test('missing books show a safe public fallback state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: '/books/missing-book' });

    expect(await screen.findByRole('heading', { name: /book not found/i })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /back to books/i }));
    expect(await screen.findByRole('heading', { name: /browse a catalog designed to feel guided, not crowded/i })).toBeInTheDocument();
  });

  test('unknown routes show the public not-found page', async () => {
    renderWithProviders(<App />, { route: '/does-not-exist' });

    expect(await screen.findByRole('heading', { name: /this page is not in the catalog/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return home/i })).toBeInTheDocument();
  });
});
