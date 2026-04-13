import { screen, waitFor } from '@testing-library/react';
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

function createAuthorBooksState() {
  return [
    {
      id: 1,
      authorId: 2,
      title: 'Worlds Apart',
      slug: 'worlds-apart',
      genre: 'Literary Fiction',
      category: 'Family Sagas',
      shortDescription: 'A layered story of fracture and memory.',
      fullDescription: 'A full description that gives the author workspace realistic seeded content to work with.',
      coverImage: 'https://placehold.co/640x900/1d4ed8/f8fafc?text=Worlds+Apart',
      amazonUrl: 'https://www.amazon.com/',
      isFeatured: true,
      _count: {
        favorites: 2,
        comments: 1
      }
    },
    {
      id: 2,
      authorId: 2,
      title: 'The First Cut',
      slug: 'the-first-cut',
      genre: 'Romance',
      category: 'Campus Stories',
      shortDescription: 'A campus romance sharpened by jealousy and vulnerability.',
      fullDescription: 'A second seeded authored title keeps the author workspace looking realistic.',
      coverImage: 'https://placehold.co/640x900/047857/f8fafc?text=The+First+Cut',
      amazonUrl: 'https://www.amazon.com/',
      isFeatured: false,
      _count: {
        favorites: 1,
        comments: 0
      }
    }
  ];
}

function createPublicAuthorState() {
  return {
    id: 2,
    name: 'Amina Dube',
    role: 'AUTHOR',
    bio: 'A novelist building a literary presence through layered fiction and reflective essays.',
    avatarUrl: '',
    websiteUrl: 'https://novalibra.example/amina-dube',
    createdAt: '2026-04-01T10:00:00.000Z',
    isFollowing: false,
    books: [
      {
        id: 1,
        slug: 'worlds-apart',
        title: 'Worlds Apart',
        shortDescription: 'A layered story of fracture and memory.',
        coverImage: 'https://placehold.co/640x900/1d4ed8/f8fafc?text=Worlds+Apart',
        _count: {
          favorites: 2,
          comments: 1
        }
      }
    ],
    _count: {
      books: 1,
      authorFollowers: 2
    }
  };
}

describe('Author workspace experience', () => {
  let booksState;
  let publicAuthorState;
  let nextBookId;

  beforeEach(() => {
    vi.clearAllMocks();
    booksState = createAuthorBooksState();
    publicAuthorState = createPublicAuthorState();
    nextBookId = 100;

    apiMock.get.mockImplementation((url) => {
      if (url === '/users/me/books') {
        return Promise.resolve({
          data: {
            books: structuredClone(booksState)
          }
        });
      }

      if (url === '/users/me/analytics') {
        return Promise.resolve({
          data: {
            analytics: {
              followerCount: 2,
              totalBooks: booksState.length,
              totalFavorites: booksState.reduce((sum, book) => sum + (book._count?.favorites || 0), 0),
              totalComments: booksState.reduce((sum, book) => sum + (book._count?.comments || 0), 0),
              totalReviews: 2,
              averageRating: 4.5,
              topBooks: booksState.map((book) => ({
                id: book.id,
                title: book.title,
                slug: book.slug,
                genre: book.genre,
                category: book.category,
                favorites: book._count?.favorites || 0,
                comments: book._count?.comments || 0,
                reviewCount: 1,
                averageRating: 4.5
              }))
            }
          }
        });
      }

      if (url === '/users/authors/2') {
        return Promise.resolve({
          data: {
            author: structuredClone(publicAuthorState)
          }
        });
      }

      return Promise.resolve({ data: {} });
    });

    apiMock.post.mockImplementation((url, body) => {
      if (url === '/books') {
        const slug = body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        const book = {
          id: nextBookId++,
          authorId: 2,
          ...body,
          slug,
          isFeatured: false,
          _count: {
            favorites: 0,
            comments: 0
          }
        };

        booksState = [book, ...booksState];
        publicAuthorState = {
          ...publicAuthorState,
          books: [
            {
              id: book.id,
              slug: book.slug,
              title: book.title,
              shortDescription: book.shortDescription,
              coverImage: book.coverImage,
              _count: {
                favorites: 0,
                comments: 0
              }
            },
            ...publicAuthorState.books
          ],
          _count: {
            ...publicAuthorState._count,
            books: publicAuthorState._count.books + 1
          }
        };

        return Promise.resolve({
          data: {
            book
          }
        });
      }

      return Promise.resolve({ data: {} });
    });

    apiMock.patch.mockImplementation((url, body) => {
      const match = url.match(/^\/books\/(\d+)$/);
      if (match) {
        const bookId = Number(match[1]);
        const slug = body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        booksState = booksState.map((book) =>
          book.id === bookId
            ? {
                ...book,
                ...body,
                slug,
                isFeatured: false
              }
            : book
        );
        publicAuthorState = {
          ...publicAuthorState,
          books: publicAuthorState.books.map((book) =>
            book.id === bookId
              ? {
                  ...book,
                  title: body.title,
                  slug,
                  shortDescription: body.shortDescription,
                  coverImage: body.coverImage
                }
              : book
          )
        };

        return Promise.resolve({
          data: {
            book: booksState.find((book) => book.id === bookId)
          }
        });
      }

      return Promise.resolve({ data: {} });
    });

    apiMock.delete.mockImplementation((url) => {
      const match = url.match(/^\/books\/(\d+)$/);
      if (match) {
        const bookId = Number(match[1]);
        booksState = booksState.filter((book) => book.id !== bookId);
        publicAuthorState = {
          ...publicAuthorState,
          books: publicAuthorState.books.filter((book) => book.id !== bookId),
          _count: {
            ...publicAuthorState._count,
            books: Math.max(0, publicAuthorState._count.books - 1)
          }
        };

        return Promise.resolve({
          data: {
            success: true
          }
        });
      }

      return Promise.resolve({ data: {} });
    });
  });

  test('author can publish, edit, and delete books from MyBooks', async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, {
      route: '/my-books',
      auth: {
        user: { id: 2, name: 'Amina Dube', role: 'AUTHOR' },
        isAuthenticated: true,
        isAuthor: true
      }
    });

    expect(await screen.findByRole('heading', { name: /publish a new title/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /your published catalog/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/title/i), 'Stage Six Browserless Author Book');
    await user.type(
      screen.getByLabelText(/short description/i),
      'A fresh author-facing summary that proves the create form works in the workspace.'
    );
    await user.type(
      screen.getByLabelText(/full description/i),
      'A detailed author-side description that proves the publish form can create a new title and refresh the catalog properly.'
    );
    await user.type(screen.getByLabelText(/cover image url/i), 'https://example.com/author-stage-six-book.png');
    await user.type(screen.getByLabelText(/purchase url/i), 'https://example.com/author-stage-six-book');
    await user.click(screen.getByRole('button', { name: /publish book/i }));

    expect(await screen.findByText(/stage six browserless author book/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /edit/i })[0]);
    const titleInput = screen.getByDisplayValue('Stage Six Browserless Author Book');
    await user.clear(titleInput);
    await user.type(titleInput, 'Stage Six Browserless Author Book Revised');
    await user.click(screen.getByRole('button', { name: /update book/i }));

    expect(await screen.findByText(/stage six browserless author book revised/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /delete/i })[0]);

    await waitFor(() => {
      expect(screen.queryByText(/stage six browserless author book revised/i)).not.toBeInTheDocument();
    });
  }, 15000);

  test('author analytics loads growth metrics and top performing books', async () => {
    renderWithProviders(<App />, {
      route: '/author-analytics',
      auth: {
        user: { id: 2, name: 'Amina Dube', role: 'AUTHOR' },
        isAuthenticated: true,
        isAuthor: true
      }
    });

    expect(await screen.findByRole('heading', { name: /see whether your presence is turning into momentum/i })).toBeInTheDocument();
    expect(screen.getByText(/^followers$/i)).toBeInTheDocument();
    expect(screen.getByText(/top performing books/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /worlds apart/i })).toBeInTheDocument();
  });

  test('public author page reflects the current authored catalog', async () => {
    renderWithProviders(<App />, {
      route: '/authors/2',
      auth: {
        user: { id: 2, name: 'Amina Dube', role: 'AUTHOR' },
        isAuthenticated: true,
        isAuthor: true
      }
    });

    expect(await screen.findByRole('heading', { level: 1, name: /^amina dube$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /books by amina dube/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /worlds apart/i })).toBeInTheDocument();
  });
});
