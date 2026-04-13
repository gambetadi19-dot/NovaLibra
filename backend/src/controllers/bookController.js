import { z } from 'zod';
import { prisma } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { sanitizeText } from '../utils/sanitize.js';

const bookSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(200),
    genre: z.string().min(2).max(120).optional().default('General'),
    category: z.string().min(2).max(120).optional().default('General'),
    isFeatured: z.boolean().optional().default(false),
    shortDescription: z.string().min(10).max(255),
    fullDescription: z.string().min(30),
    coverImage: z.string().url().optional().or(z.literal('')),
    amazonUrl: z.string().url().optional().or(z.literal(''))
  })
});

const bookIdSchema = z.object({
  params: z.object({
    bookId: z.coerce.number().int().positive()
  })
});

export const bookValidators = {
  bookSchema,
  bookIdSchema
};

const bookAuthorSelect = {
  id: true,
  name: true,
  role: true,
  isFeaturedAuthor: true,
  avatarUrl: true,
  bio: true
};

function serializeBook(book) {
  const reviews = book.reviews || [];
  const averageRating = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : null;

  return {
    ...book,
    isFavorited: Boolean(book.favorites?.length),
    reviewCount: reviews.length,
    averageRating,
    currentUserReview: reviews.find((review) => review.userId === book.__currentUserId) || null
  };
}

async function ensureCanManageBook(bookId, user) {
  const existingBook = await prisma.book.findUnique({
    where: { id: bookId },
    select: {
      id: true,
      authorId: true
    }
  });

  if (!existingBook) {
    throw new AppError('Book not found', 404);
  }

  if (user.role !== 'ADMIN' && existingBook.authorId !== user.id) {
    throw new AppError('Forbidden', 403);
  }

  return existingBook;
}

function slugify(title) {
  return sanitizeText(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const listBooks = asyncHandler(async (req, res) => {
  const userId = req.auth?.sub ? Number(req.auth.sub) : null;
  const search = req.query.q?.trim();
  const genre = req.query.genre?.trim();
  const category = req.query.category?.trim();
  const featuredOnly = req.query.featured === 'true';

  const where = {
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { shortDescription: { contains: search } },
            { fullDescription: { contains: search } },
            { genre: { contains: search } },
            { category: { contains: search } },
            { author: { name: { contains: search } } }
          ]
        }
      : {}),
    ...(genre ? { genre } : {}),
    ...(category ? { category } : {}),
    ...(featuredOnly ? { isFeatured: true } : {})
  };

  const books = await prisma.book.findMany({
    where,
    include: {
      _count: {
        select: {
          comments: true,
          favorites: true
        }
      },
      favorites: userId
        ? {
            where: {
              userId
            },
            select: {
              id: true
            }
          }
        : false,
      author: {
        select: bookAuthorSelect
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              avatarUrl: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    },
    orderBy: {
      isFeatured: 'desc'
    }
  });

  const [genres, categories] = await Promise.all([
    prisma.book.findMany({
      distinct: ['genre'],
      select: { genre: true },
      orderBy: { genre: 'asc' }
    }),
    prisma.book.findMany({
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' }
    })
  ]);

  res.json({
    success: true,
    books: books.map((book) => serializeBook({ ...book, __currentUserId: userId })),
    discovery: {
      genres: genres.map((entry) => entry.genre),
      categories: categories.map((entry) => entry.category)
    }
  });
});

export const getBookBySlug = asyncHandler(async (req, res) => {
  const slug = req.params.slug;
  const userId = req.auth?.sub ? Number(req.auth.sub) : null;

  const book = await prisma.book.findUnique({
    where: { slug },
    include: {
      favorites: userId
        ? {
            where: { userId },
            select: { id: true }
          }
        : false,
      _count: {
        select: {
          comments: true,
          favorites: true
        }
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  role: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      author: {
        select: {
          ...bookAuthorSelect,
          _count: {
            select: {
              authorFollowers: true
            }
          }
        }
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!book) {
    throw new AppError('Book not found', 404);
  }

  res.json({
    success: true,
    book: serializeBook({
      ...book,
      __currentUserId: userId,
      author: {
        ...book.author,
        followerCount: book.author?._count?.authorFollowers || 0
      },
      isFollowingAuthor: userId
        ? Boolean(
            await prisma.follow.findUnique({
              where: {
                followerId_followingId: {
                  followerId: userId,
                  followingId: book.author.id
                }
              }
            })
          )
        : false
    })
  });
});

export const createBook = asyncHandler(async (req, res) => {
  const { title, genre, category, isFeatured, shortDescription, fullDescription, coverImage, amazonUrl } = req.validated.body;
  const slug = slugify(title);

  const book = await prisma.book.create({
    data: {
      authorId: req.user.id,
      title,
      slug,
      genre,
      category,
      isFeatured: req.user.role === 'ADMIN' ? isFeatured : false,
      shortDescription,
      fullDescription,
      coverImage: coverImage || null,
      amazonUrl: amazonUrl || null
    },
    include: {
      author: {
        select: bookAuthorSelect
      }
    }
  });

  res.status(201).json({
    success: true,
    book
  });
});

export const updateBook = asyncHandler(async (req, res) => {
  const { title, genre, category, isFeatured, shortDescription, fullDescription, coverImage, amazonUrl } = req.validated.body;
  const { bookId } = req.validated.params;
  await ensureCanManageBook(bookId, req.user);

  const book = await prisma.book.update({
    where: { id: bookId },
    data: {
      title,
      slug: slugify(title),
      genre,
      category,
      ...(req.user.role === 'ADMIN' ? { isFeatured } : {}),
      shortDescription,
      fullDescription,
      coverImage: coverImage || null,
      amazonUrl: amazonUrl || null
    },
    include: {
      author: {
        select: bookAuthorSelect
      }
    }
  });

  res.json({
    success: true,
    book
  });
});

export const deleteBook = asyncHandler(async (req, res) => {
  const { bookId } = req.validated.params;
  await ensureCanManageBook(bookId, req.user);

  await prisma.book.delete({
    where: { id: bookId }
  });

  res.json({
    success: true,
    message: 'Book deleted'
  });
});
