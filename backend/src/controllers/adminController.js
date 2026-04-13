import { prisma } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [totalUsers, totalBooks, totalComments, unreadNotifications, totalMessages, totalReviews, totalFollowers] = await Promise.all([
    prisma.user.count(),
    prisma.book.count(),
    prisma.comment.count(),
    prisma.notification.count({
      where: {
        isRead: false
      }
    }),
    prisma.message.count(),
    prisma.review.count(),
    prisma.follow.count()
  ]);

  const [recentUsers, recentComments, recentMessages, topBooks, topAuthors] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, role: true }
    }),
    prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: { id: true, name: true }
        },
        book: {
          select: { id: true, title: true }
        }
      }
    }),
    prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        sender: {
          select: { id: true, name: true }
        },
        receiver: {
          select: { id: true, name: true }
        }
      }
    }),
    prisma.book.findMany({
      take: 5,
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            favorites: true,
            comments: true,
            reviews: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      }
    }),
    prisma.user.findMany({
      where: {
        role: 'AUTHOR'
      },
      take: 5,
      include: {
        _count: {
          select: {
            books: true,
            authorFollowers: true
          }
        },
        books: {
          include: {
            _count: {
              select: {
                favorites: true,
                comments: true,
                reviews: true
              }
            }
          }
        }
      }
    })
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalBooks,
      totalComments,
      unreadNotifications,
      totalMessages,
      totalReviews,
      totalFollowers
    },
    activity: {
      recentUsers,
      recentComments,
      recentMessages,
      topBooks: topBooks
        .map((book) => ({
          id: book.id,
          title: book.title,
          authorName: book.author.name,
          favorites: book._count.favorites,
          comments: book._count.comments,
          reviewCount: book._count.reviews,
          averageRating: book.reviews.length
            ? Number((book.reviews.reduce((sum, review) => sum + review.rating, 0) / book.reviews.length).toFixed(1))
            : null
        }))
        .sort((a, b) => b.favorites + b.comments + b.reviewCount - (a.favorites + a.comments + a.reviewCount)),
      topAuthors: topAuthors
        .map((author) => ({
          id: author.id,
          name: author.name,
          followerCount: author._count.authorFollowers,
          bookCount: author._count.books,
          engagementScore: author.books.reduce(
            (sum, book) => sum + book._count.favorites + book._count.comments + book._count.reviews,
            0
          )
        }))
        .sort((a, b) => b.followerCount + b.engagementScore - (a.followerCount + a.engagementScore))
    }
  });
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isFeaturedAuthor: true,
      createdAt: true,
      bio: true,
      _count: {
        select: {
          comments: true,
          favorites: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    users
  });
});

export const toggleFeaturedAuthor = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      isFeaturedAuthor: true
    }
  });

  if (!existing || existing.role !== 'AUTHOR') {
    throw new AppError('Author not found', 404);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isFeaturedAuthor: !existing.isFeaturedAuthor
    },
    select: {
      id: true,
      isFeaturedAuthor: true
    }
  });

  res.json({
    success: true,
    user
  });
});

export const listComments = asyncHandler(async (_req, res) => {
  const comments = await prisma.comment.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      book: {
        select: {
          id: true,
          title: true
        }
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    comments
  });
});
