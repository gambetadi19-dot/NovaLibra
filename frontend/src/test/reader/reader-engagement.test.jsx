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

const readerUser = {
  id: 30,
  name: 'Stage Reader',
  role: 'READER'
};

function createBookState() {
  return {
    id: 1,
    slug: 'worlds-apart',
    title: 'Worlds Apart',
    shortDescription: 'A layered story of fracture and memory.',
    fullDescription: 'A detailed description that gives the page enough body for the reader engagement tests.',
    coverImage: 'https://placehold.co/640x900/1d4ed8/f8fafc?text=Worlds+Apart',
    amazonUrl: 'https://www.amazon.com/',
    genre: 'Literary Fiction',
    category: 'Family Sagas',
    isFeatured: true,
    isFavorited: false,
    averageRating: 4.5,
    reviewCount: 1,
    currentUserReview: null,
    _count: { favorites: 2, comments: 1, reviews: 1 },
    author: {
      id: 2,
      name: 'Amina Dube',
      role: 'AUTHOR',
      bio: 'A novelist building a literary presence through layered fiction.',
      websiteUrl: 'https://novalibra.example/amina-dube',
      createdAt: '2026-04-01T10:00:00.000Z'
    },
    reviews: [
      {
        id: 9,
        userId: 3,
        rating: 5,
        content: 'An existing reader review keeps the detail page feeling alive.',
        createdAt: '2026-04-06T10:00:00.000Z',
        user: {
          id: 3,
          name: 'Nomsa Reader'
        }
      }
    ],
    comments: [
      {
        id: 11,
        userId: 3,
        content: 'The emotional pacing in this novel is beautiful.',
        createdAt: '2026-04-06T10:00:00.000Z',
        user: {
          id: 3,
          name: 'Nomsa Reader',
          role: 'READER'
        },
        replies: [
          {
            id: 21,
            userId: 2,
            content: 'Thank you for reading so attentively.',
            createdAt: '2026-04-06T12:00:00.000Z',
            user: {
              id: 2,
              name: 'Amina Dube',
              role: 'AUTHOR'
            }
          }
        ]
      }
    ]
  };
}

function createAuthorState() {
  return {
    id: 2,
    name: 'Amina Dube',
    role: 'AUTHOR',
    bio: 'A novelist building a literary presence through layered fiction.',
    websiteUrl: 'https://novalibra.example/amina-dube',
    avatarUrl: '',
    createdAt: '2026-04-01T10:00:00.000Z',
    isFollowing: false,
    books: [
      {
        id: 1,
        slug: 'worlds-apart',
        title: 'Worlds Apart',
        shortDescription: 'A layered story of fracture and memory.',
        coverImage: 'https://placehold.co/640x900/1d4ed8/f8fafc?text=Worlds+Apart',
        _count: { favorites: 2, comments: 1 }
      }
    ],
    _count: {
      books: 1,
      authorFollowers: 2
    }
  };
}

describe('Reader engagement experience', () => {
  let bookState;
  let authorState;
  let nextCommentId;
  let nextReplyId;
  let nextReviewId;

  beforeEach(() => {
    vi.clearAllMocks();
    bookState = createBookState();
    authorState = createAuthorState();
    nextCommentId = 100;
    nextReplyId = 200;
    nextReviewId = 300;

    apiMock.get.mockImplementation((url) => {
      if (url === '/books/worlds-apart') {
        return Promise.resolve({
          data: {
            book: structuredClone(bookState)
          }
        });
      }

      if (url === '/users/authors/2') {
        return Promise.resolve({
          data: {
            author: structuredClone(authorState)
          }
        });
      }

      return Promise.resolve({ data: {} });
    });

    apiMock.post.mockImplementation((url, body) => {
      if (url === '/favorites/1/toggle') {
        bookState.isFavorited = !bookState.isFavorited;
        bookState._count.favorites += bookState.isFavorited ? 1 : -1;
        return Promise.resolve({
          data: {
            favorited: bookState.isFavorited
          }
        });
      }

      if (url === '/reviews') {
        const existingReview = bookState.reviews.find((review) => review.userId === readerUser.id);
        const reviewId = existingReview?.id || nextReviewId++;
        const review = {
          id: reviewId,
          userId: readerUser.id,
          rating: body.rating,
          content: body.content,
          createdAt: existingReview?.createdAt || '2026-04-13T10:00:00.000Z',
          user: {
            id: readerUser.id,
            name: readerUser.name
          }
        };

        bookState.currentUserReview = {
          rating: body.rating,
          content: body.content
        };
        bookState.reviewCount = existingReview ? bookState.reviewCount : bookState.reviewCount + 1;
        bookState.reviews = [...bookState.reviews.filter((item) => item.userId !== readerUser.id), review];

        return Promise.resolve({
          data: {
            review
          }
        });
      }

      if (url === '/comments') {
        const comment = {
          id: nextCommentId++,
          userId: readerUser.id,
          content: body.content,
          createdAt: '2026-04-13T11:00:00.000Z',
          user: {
            id: readerUser.id,
            name: readerUser.name,
            role: 'READER'
          },
          replies: []
        };

        bookState.comments = [comment, ...bookState.comments];
        bookState._count.comments += 1;

        return Promise.resolve({
          data: {
            comment
          }
        });
      }

      const replyMatch = url.match(/^\/comments\/(\d+)\/replies$/);
      if (replyMatch) {
        const commentId = Number(replyMatch[1]);
        const reply = {
          id: nextReplyId++,
          userId: readerUser.id,
          content: body.content,
          createdAt: '2026-04-13T11:05:00.000Z',
          user: {
            id: readerUser.id,
            name: readerUser.name,
            role: 'READER'
          }
        };

        bookState.comments = bookState.comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: [...comment.replies, reply]
              }
            : comment
        );

        return Promise.resolve({
          data: {
            reply
          }
        });
      }

      if (url === '/follows/authors/2/toggle') {
        authorState.isFollowing = !authorState.isFollowing;
        authorState._count.authorFollowers += authorState.isFollowing ? 1 : -1;

        return Promise.resolve({
          data: {
            following: authorState.isFollowing
          }
        });
      }

      return Promise.resolve({ data: {} });
    });

    apiMock.patch.mockImplementation((url, body) => {
      const match = url.match(/^\/comments\/(\d+)$/);
      if (match) {
        const commentId = Number(match[1]);
        bookState.comments = bookState.comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                content: body.content
              }
            : comment
        );

        return Promise.resolve({
          data: {
            comment: bookState.comments.find((comment) => comment.id === commentId)
          }
        });
      }

      return Promise.resolve({ data: {} });
    });

    apiMock.delete.mockImplementation((url) => {
      const reviewMatch = url.match(/^\/reviews\/(\d+)$/);
      if (reviewMatch) {
        const reviewId = Number(reviewMatch[1]);
        const removed = bookState.reviews.find((review) => review.id === reviewId);
        bookState.reviews = bookState.reviews.filter((review) => review.id !== reviewId);
        if (removed?.userId === readerUser.id) {
          bookState.currentUserReview = null;
          bookState.reviewCount -= 1;
        }

        return Promise.resolve({
          data: {
            success: true
          }
        });
      }

      const commentMatch = url.match(/^\/comments\/(\d+)$/);
      if (commentMatch) {
        const commentId = Number(commentMatch[1]);
        const beforeLength = bookState.comments.length;
        bookState.comments = bookState.comments.filter((comment) => comment.id !== commentId);
        if (bookState.comments.length < beforeLength) {
          bookState._count.comments -= 1;
        }

        return Promise.resolve({
          data: {
            success: true
          }
        });
      }

      return Promise.resolve({ data: {} });
    });
  });

  test('reader can save and unsave a book from the detail page', async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, {
      route: '/books/worlds-apart',
      auth: {
        user: readerUser,
        isAuthenticated: true,
        isReader: true
      }
    });

    await screen.findByRole('heading', { name: /worlds apart/i });

    await user.click(screen.getByRole('button', { name: /save book/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^saved$/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /^saved$/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save book/i })).toBeInTheDocument();
    });
  });

  test('reader can publish and delete a review from the detail page', async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, {
      route: '/books/worlds-apart',
      auth: {
        user: readerUser,
        isAuthenticated: true,
        isReader: true
      }
    });

    await screen.findByText(/reviews and ratings/i);

    await user.type(
      screen.getByPlaceholderText(/what did this book do especially well for you as a reader/i),
      'This review is detailed enough to prove the reader can publish thoughtful feedback.'
    );
    await user.click(screen.getByRole('button', { name: /publish review/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /update review/i })).toBeInTheDocument();
    });

    expect(screen.getAllByText(/this review is detailed enough/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(screen.queryAllByText(/this review is detailed enough/i)).toHaveLength(0);
    });
  });

  test('reader can comment, edit, reply, and delete in the discussion thread', async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, {
      route: '/books/worlds-apart',
      auth: {
        user: readerUser,
        isAuthenticated: true,
        isReader: true
      }
    });

    await screen.findByRole('heading', { name: /threaded community conversation/i });

    await user.type(
      screen.getByLabelText(/add a comment/i),
      'This new top-level comment confirms the discussion composer works for readers.'
    );
    await user.click(screen.getByRole('button', { name: /^post$/i }));

    expect(await screen.findByText(/this new top-level comment confirms/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /edit/i })[0]);
    await user.clear(screen.getByLabelText(/edit your comment/i));
    await user.type(screen.getByLabelText(/edit your comment/i), 'The edited version confirms readers can refine their own discussion posts.');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText(/the edited version confirms readers can refine/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /reply/i })[0]);
    await user.type(
      screen.getByLabelText(/write a reply/i),
      'This reply shows the nested discussion flow still works for readers.'
    );
    const replyComposer = screen.getByLabelText(/write a reply/i).closest('form');
    await user.click(within(replyComposer).getByRole('button', { name: /^reply$/i }));

    expect(await screen.findByText(/this reply shows the nested discussion flow/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /delete/i })[0]);

    await waitFor(() => {
      expect(screen.queryByText(/the edited version confirms readers can refine/i)).not.toBeInTheDocument();
    });
  });

  test('reader can follow and unfollow an author from the public author page', async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, {
      route: '/authors/2',
      auth: {
        user: readerUser,
        isAuthenticated: true,
        isReader: true
      }
    });

    await screen.findByRole('heading', { level: 1, name: /^amina dube$/i });

    await user.click(screen.getByRole('button', { name: /follow author/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /following author/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /following author/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /follow author/i })).toBeInTheDocument();
    });
  });
});
