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

function makeBookState() {
  return {
    id: 1,
    slug: 'worlds-apart',
    title: 'Worlds Apart',
    shortDescription: 'A layered story of fracture and memory.',
    fullDescription: 'A detailed description that gives the page enough body for the engagement system coverage.',
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

function makeAuthorState() {
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

describe('Engagement system experience', () => {
  let bookState;
  let authorState;
  let nextCommentId;
  let nextReplyId;
  let nextReviewId;

  beforeEach(() => {
    vi.clearAllMocks();
    bookState = makeBookState();
    authorState = makeAuthorState();
    nextCommentId = 100;
    nextReplyId = 200;
    nextReviewId = 300;

    apiMock.get.mockImplementation((url) => {
      if (url === '/books/worlds-apart') {
        return Promise.resolve({ data: { book: structuredClone(bookState) } });
      }

      if (url === '/users/authors/2') {
        return Promise.resolve({ data: { author: structuredClone(authorState) } });
      }

      return Promise.resolve({ data: {} });
    });

    apiMock.post.mockImplementation((url, body) => {
      if (url === '/favorites/1/toggle') {
        bookState.isFavorited = !bookState.isFavorited;
        bookState._count.favorites += bookState.isFavorited ? 1 : -1;
        return Promise.resolve({ data: { favorited: bookState.isFavorited } });
      }

      if (url === '/reviews') {
        const existing = bookState.reviews.find((review) => review.userId === readerUser.id);
        const review = {
          id: existing?.id || nextReviewId++,
          userId: readerUser.id,
          rating: body.rating,
          content: body.content,
          createdAt: existing?.createdAt || '2026-04-13T10:00:00.000Z',
          user: { id: readerUser.id, name: readerUser.name }
        };

        bookState.currentUserReview = { rating: body.rating, content: body.content };
        bookState.reviews = [...bookState.reviews.filter((review) => review.userId !== readerUser.id), review];
        if (!existing) {
          bookState.reviewCount += 1;
          bookState._count.reviews += 1;
        }

        return Promise.resolve({ data: { review } });
      }

      if (url === '/comments') {
        const comment = {
          id: nextCommentId++,
          userId: readerUser.id,
          content: body.content,
          createdAt: '2026-04-13T11:00:00.000Z',
          user: { id: readerUser.id, name: readerUser.name, role: 'READER' },
          replies: []
        };

        bookState.comments = [comment, ...bookState.comments];
        bookState._count.comments += 1;

        return Promise.resolve({ data: { comment } });
      }

      const replyMatch = url.match(/^\/comments\/(\d+)\/replies$/);
      if (replyMatch) {
        const commentId = Number(replyMatch[1]);
        const reply = {
          id: nextReplyId++,
          userId: readerUser.id,
          content: body.content,
          createdAt: '2026-04-13T11:05:00.000Z',
          user: { id: readerUser.id, name: readerUser.name, role: 'READER' }
        };

        bookState.comments = bookState.comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: [...comment.replies, reply]
              }
            : comment
        );

        return Promise.resolve({ data: { reply } });
      }

      if (url === '/follows/authors/2/toggle') {
        authorState.isFollowing = !authorState.isFollowing;
        authorState._count.authorFollowers += authorState.isFollowing ? 1 : -1;
        return Promise.resolve({ data: { following: authorState.isFollowing } });
      }

      return Promise.resolve({ data: {} });
    });

    apiMock.patch.mockImplementation((url, body) => {
      const commentMatch = url.match(/^\/comments\/(\d+)$/);
      if (commentMatch) {
        const commentId = Number(commentMatch[1]);
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
          bookState._count.reviews -= 1;
        }

        return Promise.resolve({ data: { success: true } });
      }

      const commentMatch = url.match(/^\/comments\/(\d+)$/);
      if (commentMatch) {
        const commentId = Number(commentMatch[1]);
        const beforeLength = bookState.comments.length;
        bookState.comments = bookState.comments.filter((comment) => comment.id !== commentId);
        if (bookState.comments.length < beforeLength) {
          bookState._count.comments -= 1;
        }
        return Promise.resolve({ data: { success: true } });
      }

      return Promise.resolve({ data: { success: true } });
    });
  });

  test('reader can save then unsave a book and the visible save count changes with it', async () => {
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
    expect(screen.getByText(/3 saves/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^saved$/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save book/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/2 saves/i)).toBeInTheDocument();
  });

  test('reader can publish, update, and delete a review on the same book', async () => {
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

    const reviewBox = screen.getByPlaceholderText(/what did this book do especially well for you as a reader/i);
    await user.type(reviewBox, 'This review proves the Stage 9 engagement gate can publish thoughtful feedback.');
    await user.click(screen.getByRole('button', { name: /publish review/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /update review/i })).toBeInTheDocument();
    });
    expect(screen.getAllByText(/this review proves the stage 9 engagement gate/i).length).toBeGreaterThan(0);

    await user.clear(reviewBox);
    await user.type(reviewBox, 'This updated review proves the same reader stays on a single review record.');
    await user.click(screen.getByRole('button', { name: /update review/i }));
    expect(screen.getAllByText(/this updated review proves the same reader/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => {
      expect(screen.queryAllByText(/this updated review proves the same reader/i)).toHaveLength(0);
    });
  });

  test('reader can comment, reply, edit, and delete within the book discussion thread', async () => {
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
      'This new Stage 9 comment confirms the engagement gate can create top-level discussion.'
    );
    await user.click(screen.getByRole('button', { name: /^post$/i }));

    const createdComment = await screen.findByText(/this new stage 9 comment confirms/i);
    const createdThread = createdComment.closest('[id^="comment-"]');
    expect(within(createdThread).getByText(/stage reader/i)).toBeInTheDocument();

    await user.click(within(createdThread).getByRole('button', { name: /edit/i }));
    await user.clear(screen.getByLabelText(/edit your comment/i));
    await user.type(screen.getByLabelText(/edit your comment/i), 'This edited Stage 9 comment confirms reader-owned discussion can be refined.');
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText(/this edited stage 9 comment confirms/i)).toBeInTheDocument();

    const updatedThread = screen.getByText(/this edited stage 9 comment confirms/i).closest('[id^="comment-"]');
    await user.click(within(updatedThread).getByRole('button', { name: /reply/i }));
    await user.type(screen.getByLabelText(/write a reply/i), 'This Stage 9 reply proves nested discussion still works.');
    const replyComposer = screen.getByLabelText(/write a reply/i).closest('form');
    await user.click(within(replyComposer).getByRole('button', { name: /^reply$/i }));
    expect(await screen.findByText(/this stage 9 reply proves nested discussion still works/i)).toBeInTheDocument();

    await user.click(within(updatedThread).getByRole('button', { name: /delete/i }));
    await waitFor(() => {
      expect(screen.queryByText(/this edited stage 9 comment confirms/i)).not.toBeInTheDocument();
    });
  });

  test('reader can follow and unfollow an author while follower count updates', async () => {
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
    expect(screen.getByText(/2 followers/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /follow author/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /following author/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/3 followers/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /following author/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /follow author/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/2 followers/i)).toBeInTheDocument();
  });
});
