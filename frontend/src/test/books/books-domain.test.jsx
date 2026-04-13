import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../../App';
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

function createBooks() {
  return [
    {
      id: 1,
      slug: 'worlds-apart',
      title: 'Worlds Apart',
      shortDescription: 'A layered story of fracture and memory.',
      fullDescription: 'A detailed description for Worlds Apart that keeps the book detail page rich enough for Stage 8 coverage.',
      coverImage: 'https://placehold.co/640x900/1d4ed8/f8fafc?text=Worlds+Apart',
      amazonUrl: 'https://www.amazon.com/',
      genre: 'Literary Fiction',
      category: 'Family Sagas',
      isFeatured: true,
      isFavorited: false,
      averageRating: 5,
      reviewCount: 1,
      currentUserReview: null,
      _count: { favorites: 2, comments: 1, reviews: 1 },
      author: {
        id: 2,
        name: 'Amina Dube',
        role: 'AUTHOR',
        bio: 'A novelist building a literary presence through layered fiction.'
      },
      reviews: [
        {
          id: 30,
          userId: 3,
          rating: 5,
          content: 'An existing review keeps this detail page lively enough for catalog testing.',
          createdAt: '2026-04-10T10:00:00.000Z',
          user: { id: 3, name: 'Nomsa Reader' }
        }
      ],
      comments: [
        {
          id: 10,
          userId: 3,
          content: 'The emotional pacing in this novel is beautiful.',
          createdAt: '2026-04-06T10:00:00.000Z',
          user: { id: 3, name: 'Nomsa Reader', role: 'READER' },
          replies: []
        }
      ]
    },
    {
      id: 2,
      slug: 'margaret-hamata-a-woman-of-courage',
      title: 'Margaret Hamata: A Woman of Courage',
      shortDescription: 'A portrait of resilience shaped by prejudice and aspiration.',
      fullDescription: 'A rich description for Margaret Hamata that gives the book detail page enough content for domain coverage.',
      coverImage: 'https://placehold.co/640x900/f59e0b/0f172a?text=Margaret+Hamata',
      amazonUrl: 'https://www.amazon.com/',
      genre: 'Historical Fiction',
      category: 'Women of Courage',
      isFeatured: true,
      isFavorited: false,
      averageRating: 4,
      reviewCount: 1,
      currentUserReview: null,
      _count: { favorites: 1, comments: 1, reviews: 1 },
      author: {
        id: 2,
        name: 'Amina Dube',
        role: 'AUTHOR',
        bio: 'A novelist building a literary presence through layered fiction.'
      },
      reviews: [],
      comments: []
    },
    {
      id: 3,
      slug: 'the-first-cut',
      title: 'The First Cut',
      shortDescription: 'A campus romance sharpened by irreversible choices.',
      fullDescription: 'A detailed description for The First Cut so the catalog still has a non-featured, non-historical option in the mix.',
      coverImage: 'https://placehold.co/640x900/047857/f8fafc?text=The+First+Cut',
      amazonUrl: 'https://www.amazon.com/',
      genre: 'Romance',
      category: 'Campus Stories',
      isFeatured: false,
      isFavorited: false,
      averageRating: null,
      reviewCount: 0,
      currentUserReview: null,
      _count: { favorites: 0, comments: 0, reviews: 0 },
      author: {
        id: 2,
        name: 'Amina Dube',
        role: 'AUTHOR',
        bio: 'A novelist building a literary presence through layered fiction.'
      },
      reviews: [],
      comments: []
    }
  ];
}

function filterBooks(url, books) {
  const query = url.split('?')[1];
  const params = new URLSearchParams(query || '');

  return books.filter((book) => {
    const q = params.get('q')?.toLowerCase();
    const genre = params.get('genre');
    const category = params.get('category');
    const featured = params.get('featured') === 'true';

    const matchesQuery =
      !q ||
      [book.title, book.shortDescription, book.fullDescription, book.genre, book.category, book.author.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q));

    return matchesQuery && (!genre || book.genre === genre) && (!category || book.category === category) && (!featured || book.isFeatured);
  });
}

describe('Book domain experience', () => {
  let books;

  beforeEach(() => {
    vi.clearAllMocks();
    books = createBooks();

    apiMock.get.mockImplementation((url) => {
      if (url.startsWith('/books')) {
        const slug = url.replace('/books/', '');
        if (url === '/books' || url.startsWith('/books?')) {
          return Promise.resolve({
            data: {
              books: structuredClone(filterBooks(url, books)),
              discovery: {
                genres: ['Historical Fiction', 'Literary Fiction', 'Romance'],
                categories: ['Campus Stories', 'Family Sagas', 'Women of Courage']
              }
            }
          });
        }

        const book = books.find((entry) => entry.slug === slug);
        if (book) {
          return Promise.resolve({ data: { book: structuredClone(book) } });
        }

        return Promise.reject({
          response: {
            data: {
              message: 'Book not found'
            }
          }
        });
      }

      if (url === '/users/authors?featured=true') {
        return Promise.resolve({ data: { authors: [] } });
      }

      if (url === '/announcements') {
        return Promise.resolve({ data: { announcements: [] } });
      }

      return Promise.resolve({ data: {} });
    });

    apiMock.post.mockResolvedValue({ data: {} });
    apiMock.patch.mockResolvedValue({ data: {} });
    apiMock.delete.mockResolvedValue({ data: {} });
  });

  test('books page supports search, genre/category filters, featured-only mode, and reset', async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, { route: '/books' });

    expect(await screen.findByRole('heading', { name: /browse a catalog designed to feel guided, not crowded/i })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /worlds apart/i }).length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText(/search/i), 'Margaret');
    await waitFor(() => {
      expect(apiMock.get).toHaveBeenLastCalledWith('/books?q=Margaret');
    });
    expect((await screen.findAllByRole('heading', { name: /margaret hamata/i })).length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { name: /the first cut/i })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/genre/i), 'Historical Fiction');
    await waitFor(() => {
      expect(apiMock.get).toHaveBeenLastCalledWith('/books?q=Margaret&genre=Historical+Fiction');
    });

    await user.selectOptions(screen.getByLabelText(/category/i), 'Women of Courage');
    await waitFor(() => {
      expect(apiMock.get).toHaveBeenLastCalledWith('/books?q=Margaret&genre=Historical+Fiction&category=Women+of+Courage');
    });

    await user.click(screen.getByLabelText(/show only featured placements/i));
    await waitFor(() => {
      expect(apiMock.get).toHaveBeenLastCalledWith('/books?q=Margaret&genre=Historical+Fiction&category=Women+of+Courage&featured=true');
    });

    await user.click(screen.getByRole('button', { name: /reset filters/i }));
    await waitFor(() => {
      expect(apiMock.get).toHaveBeenLastCalledWith('/books');
    });
    expect(await screen.findByRole('heading', { name: /the first cut/i })).toBeInTheDocument();
  });

  test('books page shows a safe empty state when filters remove every result', async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, { route: '/books' });

    await screen.findByRole('heading', { name: /browse a catalog designed to feel guided, not crowded/i });
    await user.type(screen.getByLabelText(/search/i), 'NoSuchNovaLibraBook');

    expect(await screen.findByRole('heading', { name: /no books in the catalog/i })).toBeInTheDocument();
  });

  test('book detail shows commerce, review, and discussion surfaces for signed-out visitors', async () => {
    renderWithProviders(<App />, { route: '/books/worlds-apart' });

    expect(await screen.findByRole('heading', { name: /worlds apart/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /buy on amazon/i })).toHaveAttribute('href', 'https://www.amazon.com/');
    expect(screen.getByText(/1 comments/i)).toBeInTheDocument();
    expect(screen.getByText(/1 reviews/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /sign in to review/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /join the discussion/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save book/i })).not.toBeInTheDocument();
  });

  test('book detail preserves author navigation and discussion thread context', async () => {
    renderWithProviders(<App />, { route: '/books/worlds-apart?commentId=10' });

    expect(await screen.findByRole('heading', { name: /worlds apart/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /by amina dube/i })).toHaveAttribute('href', '/authors/2');
    expect(screen.getByRole('heading', { name: /threaded community conversation/i })).toBeInTheDocument();
    const commentRow = screen.getByText(/the emotional pacing in this novel is beautiful/i).closest('#comment-10');
    expect(within(commentRow).getByText(/nomsa reader/i)).toBeInTheDocument();
  });
});
