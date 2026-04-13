import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../../App';
import { renderWithProviders } from '../renderWithProviders';

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.startsWith('/books')) {
        return Promise.resolve({
          data: {
            books: [
              {
                id: 1,
                slug: 'worlds-apart',
                title: 'Worlds Apart',
                shortDescription: 'A featured literary work.',
                coverImage: '',
                genre: 'Literary Fiction',
                category: 'Family Sagas',
                isFeatured: true,
                isFavorited: false,
                _count: { favorites: 2, comments: 1, reviews: 1 },
                author: { id: 2, name: 'Amina Dube', role: 'AUTHOR' }
              }
            ]
          }
        });
      }

      if (url.startsWith('/users/authors')) {
        return Promise.resolve({
          data: {
            authors: [
              {
                id: 2,
                name: 'Amina Dube',
                bio: 'Featured author bio',
                websiteUrl: '',
                _count: { books: 3 }
              }
            ]
          }
        });
      }

      if (url.startsWith('/announcements')) {
        return Promise.resolve({
          data: {
            announcements: [
              {
                id: 1,
                title: 'Launch update',
                content: 'NovaLibra is live.'
              }
            ]
          }
        });
      }

      return Promise.resolve({ data: {} });
    })
  }
}));

describe('Frontend smoke', () => {
  test('homepage renders branded hero content', async () => {
    renderWithProviders(<App />, { route: '/' });

    expect(await screen.findByRole('heading', { name: /a literary home/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /explore books/i })).toBeInTheDocument();
  });

  test('books route renders from navigation map', async () => {
    renderWithProviders(<App />, { route: '/books' });

    expect(await screen.findByRole('heading', { name: /browse a catalog designed to feel guided, not crowded/i })).toBeInTheDocument();
  });

  test('login route renders sign-in form', async () => {
    renderWithProviders(<App />, { route: '/login' });

    expect(await screen.findByRole('heading', { name: /sign in to your novalibra account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
