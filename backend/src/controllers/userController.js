import { z } from 'zod';
import { prisma } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    bio: z.string().max(400).optional().default(''),
    avatarUrl: z.string().url().optional().or(z.literal('')),
    websiteUrl: z.string().url().optional().or(z.literal(''))
  })
});

export const userValidators = {
  updateProfileSchema
};

const publicBookSelect = {
  id: true,
  title: true,
  slug: true,
  genre: true,
  category: true,
  isFeatured: true,
  shortDescription: true,
  coverImage: true,
  amazonUrl: true,
  createdAt: true,
  _count: {
    select: {
      comments: true,
      favorites: true
    }
  }
};

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatarUrl: true,
      websiteUrl: true,
      createdAt: true,
      updatedAt: true,
      favorites: {
        include: {
          book: true
        }
      },
      followingAuthors: {
        include: {
          following: {
            select: {
              id: true,
              name: true,
              role: true,
              avatarUrl: true,
              bio: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      reviews: {
        include: {
          book: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 5
      },
      comments: {
        include: {
          book: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      },
      books: {
        select: publicBookSelect,
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          authorFollowers: true
        }
      }
    }
  });

  if (!profile) {
    throw new AppError('Profile not found', 404);
  }

  res.json({
    success: true,
    profile
  });
});

export const getMyBooks = asyncHandler(async (req, res) => {
  const books = await prisma.book.findMany({
    where: {
      authorId: req.user.id
    },
    include: {
      _count: {
        select: {
          comments: true,
          favorites: true
        }
      },
      author: {
        select: {
          id: true,
          name: true,
          role: true,
          avatarUrl: true,
          bio: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    books
  });
});

export const getAdminContact = asyncHandler(async (_req, res) => {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      bio: true,
      websiteUrl: true
    }
  });

  if (!admin) {
    throw new AppError('Admin contact not found', 404);
  }

  res.json({
    success: true,
    admin
  });
});

export const listAuthorContacts = asyncHandler(async (_req, res) => {
  const authors = await prisma.user.findMany({
    where: {
      role: 'AUTHOR',
      ...(String(_req.query.featured) === 'true' ? { isFeaturedAuthor: true } : {})
    },
    select: {
      id: true,
      name: true,
      role: true,
      bio: true,
      avatarUrl: true,
      websiteUrl: true,
      isFeaturedAuthor: true,
      _count: {
        select: {
          books: true,
          authorFollowers: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  res.json({
    success: true,
    authors
  });
});

export const getPublicAuthor = asyncHandler(async (req, res) => {
  const authorId = Number(req.params.authorId);
  const viewerId = req.auth?.sub ? Number(req.auth.sub) : null;
  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: {
      id: true,
      name: true,
      role: true,
      bio: true,
      avatarUrl: true,
      websiteUrl: true,
      isFeaturedAuthor: true,
      createdAt: true,
      books: {
        select: publicBookSelect,
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          books: true,
          authorFollowers: true
        }
      }
    }
  });

  if (!author || author.role !== 'AUTHOR') {
    throw new AppError('Author not found', 404);
  }

  const isFollowing =
    viewerId && viewerId !== authorId
      ? Boolean(
          await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: viewerId,
                followingId: authorId
              }
            }
          })
        )
      : false;

  res.json({
    success: true,
    author: {
      ...author,
      isFollowing
    }
  });
});

export const getAuthorAnalytics = asyncHandler(async (req, res) => {
  const authorId = req.user.id;
  const books = await prisma.book.findMany({
    where: { authorId },
    include: {
      _count: {
        select: {
          comments: true,
          favorites: true,
          reviews: true
        }
      },
      reviews: {
        select: {
          rating: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const followerCount = await prisma.follow.count({
    where: {
      followingId: authorId
    }
  });

  const totalFavorites = books.reduce((sum, book) => sum + (book._count.favorites || 0), 0);
  const totalComments = books.reduce((sum, book) => sum + (book._count.comments || 0), 0);
  const totalReviews = books.reduce((sum, book) => sum + (book._count.reviews || 0), 0);
  const allRatings = books.flatMap((book) => book.reviews.map((review) => review.rating));
  const averageRating = allRatings.length ? Number((allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length).toFixed(1)) : null;

  const topBooks = books
    .map((book) => ({
      id: book.id,
      title: book.title,
      slug: book.slug,
      genre: book.genre,
      category: book.category,
      favorites: book._count.favorites,
      comments: book._count.comments,
      reviewCount: book._count.reviews,
      averageRating: book.reviews.length
        ? Number((book.reviews.reduce((sum, review) => sum + review.rating, 0) / book.reviews.length).toFixed(1))
        : null
    }))
    .sort((a, b) => b.favorites + b.comments + b.reviewCount - (a.favorites + a.comments + a.reviewCount))
    .slice(0, 5);

  res.json({
    success: true,
    analytics: {
      followerCount,
      totalBooks: books.length,
      totalFavorites,
      totalComments,
      totalReviews,
      averageRating,
      topBooks
    }
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, avatarUrl, websiteUrl } = req.validated.body;

  const profile = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      name,
      bio,
      avatarUrl: avatarUrl || null,
      websiteUrl: websiteUrl || null
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatarUrl: true,
      websiteUrl: true,
      createdAt: true,
      updatedAt: true
    }
  });

  res.json({
    success: true,
    profile
  });
});
