import bcrypt from 'bcryptjs';
import { PrismaClient, NotificationType, Role, MessageStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.follow.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.reply.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const [admin, author, user, reader] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'NovaLibra Admin',
        email: 'admin@example.com',
        passwordHash,
        role: Role.ADMIN,
        bio: 'Platform steward overseeing announcements, moderation, and the NovaLibra literary community.',
        avatarUrl: 'https://placehold.co/200x200/1e293b/f8fafc?text=NL',
        websiteUrl: 'https://novalibra.example/admin'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Amina Dube',
        email: 'author@example.com',
        passwordHash,
        role: Role.AUTHOR,
        isFeaturedAuthor: true,
        bio: 'A novelist building a literary presence through layered fiction, reflective essays, and close reader conversation.',
        avatarUrl: 'https://placehold.co/200x200/2d1b69/f8fafc?text=AD',
        websiteUrl: 'https://novalibra.example/amina-dube'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Nomsa Reader',
        email: 'user@example.com',
        passwordHash,
        role: Role.READER,
        bio: 'A devoted reader who loves reflective African literature and book-club conversations.',
        avatarUrl: 'https://placehold.co/200x200/0f172a/f8fafc?text=NR'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Tapiwa Moyo',
        email: 'reader2@example.com',
        passwordHash,
        role: Role.READER,
        bio: 'Follows authors whose stories move between scholarship, memory, and social history.',
        avatarUrl: 'https://placehold.co/200x200/111827/f8fafc?text=TM'
      }
    })
  ]);

  const books = await Promise.all([
    prisma.book.create({
      data: {
        authorId: author.id,
        title: 'Worlds Apart',
        slug: 'worlds-apart',
        genre: 'Literary Fiction',
        category: 'Family Sagas',
        isFeatured: true,
        shortDescription: 'A layered story of fracture, memory, and the quiet ache of divided loyalties.',
        fullDescription:
          'Set against a richly textured African social landscape, Worlds Apart explores family loyalty, grief, betrayal, and the emotional cost of silence. The novel follows characters whose lives stretch between love and duty, revealing how private wounds shape public choices.',
        coverImage: 'https://placehold.co/640x900/1d4ed8/f8fafc?text=Worlds+Apart',
        amazonUrl: 'https://www.amazon.com/'
      }
    }),
    prisma.book.create({
      data: {
        authorId: author.id,
        title: 'Margaret Hamata: A Woman of Courage',
        slug: 'margaret-hamata-a-woman-of-courage',
        genre: 'Historical Fiction',
        category: 'Women of Courage',
        isFeatured: true,
        shortDescription: 'A portrait of resilience shaped by prejudice, aspiration, and inner strength.',
        fullDescription:
          'Margaret Hamata: A Woman of Courage centers a woman whose determination refuses to yield to hardship. Through moments of tenderness, conflict, and renewal, the novel reflects on survival, dignity, and the costs of dreaming beyond one’s station.',
        coverImage: 'https://placehold.co/640x900/f59e0b/0f172a?text=Margaret+Hamata',
        amazonUrl: 'https://www.amazon.com/'
      }
    }),
    prisma.book.create({
      data: {
        authorId: author.id,
        title: 'The First Cut',
        slug: 'the-first-cut',
        genre: 'Romance',
        category: 'Campus Stories',
        isFeatured: false,
        shortDescription: 'A campus romance sharpened by jealousy, vulnerability, and irreversible choices.',
        fullDescription:
          'The First Cut begins with youthful longing and expands into a moving meditation on trust, envy, and the small decisions that leave permanent marks. The novel moves with emotional urgency while remaining attentive to the social worlds that frame love.',
        coverImage: 'https://placehold.co/640x900/047857/f8fafc?text=The+First+Cut',
        amazonUrl: 'https://www.amazon.com/'
      }
    })
  ]);

  const announcement = await prisma.announcement.create({
    data: {
      title: 'New Reader Community Launch',
      content:
        'The NovaLibra literary platform is now live with book discussions, author replies, announcements, and saved favourites for every member.'
    }
  });

  const commentOne = await prisma.comment.create({
    data: {
      userId: user.id,
      bookId: books[0].id,
      content:
        'The emotional pacing in this novel is beautiful. I would love to hear what inspired the family dynamics in the story.'
    }
  });

  const commentTwo = await prisma.comment.create({
    data: {
      userId: reader.id,
      bookId: books[1].id,
      content:
        'Margaret Hamata felt deeply humane to me. The courage in the title never felt abstract.'
    }
  });

  await prisma.reply.createMany({
    data: [
      {
        commentId: commentOne.id,
        userId: author.id,
        content:
          'Thank you for reading so attentively. Much of the family tension came from observing how love and duty often compete in silence.'
      },
      {
        commentId: commentTwo.id,
        userId: author.id,
        content:
          'That means a lot. I wanted courage to feel lived rather than symbolic, rooted in daily struggle.'
      }
    ]
  });

  await prisma.favorite.createMany({
    data: [
      { userId: user.id, bookId: books[0].id },
      { userId: user.id, bookId: books[2].id },
      { userId: reader.id, bookId: books[1].id }
    ]
  });

  await prisma.follow.createMany({
    data: [
      { followerId: user.id, followingId: author.id },
      { followerId: reader.id, followingId: author.id }
    ]
  });

  await prisma.review.createMany({
    data: [
      {
        userId: user.id,
        bookId: books[0].id,
        rating: 5,
        content: 'This novel felt emotionally precise all the way through. The family tensions stayed intimate without losing their larger social weight.'
      },
      {
        userId: reader.id,
        bookId: books[1].id,
        rating: 4,
        content: 'I appreciated how grounded the courage in this story felt. The character work made the title feel earned rather than symbolic.'
      }
    ]
  });

  await prisma.message.createMany({
    data: [
      {
        senderId: user.id,
        receiverId: author.id,
        subject: 'Book club invitation',
        content: 'Would you be open to a short virtual appearance for our literature group next month? Worlds Apart sparked a wonderful discussion.',
        status: MessageStatus.UNREAD
      },
      {
        senderId: author.id,
        receiverId: user.id,
        subject: 'Re: Book club invitation',
        content: 'Thank you for inviting me. Please share your preferred dates and audience size and I will see what is possible.',
        status: MessageStatus.READ
      },
      {
        senderId: reader.id,
        receiverId: admin.id,
        subject: 'Signed copies',
        content: 'Will signed editions be available through the platform later this year?',
        status: MessageStatus.UNREAD
      }
    ]
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        type: NotificationType.WELCOME,
        title: 'Welcome to the platform',
        message: 'Your reader account is ready. Follow books, join discussions, and message authors or the platform team.'
      },
      {
        userId: user.id,
        type: NotificationType.COMMENT_REPLY,
        title: 'Author replied to your comment',
        message: 'Amina Dube replied to your comment on Worlds Apart.'
      },
      {
        userId: user.id,
        type: NotificationType.ANNOUNCEMENT,
        title: announcement.title,
        message: announcement.content
      },
      {
        userId: reader.id,
        type: NotificationType.ANNOUNCEMENT,
        title: announcement.title,
        message: announcement.content
      },
      {
        userId: author.id,
        type: NotificationType.MESSAGE,
        title: 'New reader message',
        message: 'Nomsa Reader sent you a message for the author: Book club invitation'
      },
      {
        userId: author.id,
        type: NotificationType.FOLLOW,
        title: 'New follower',
        message: 'Nomsa Reader is now following your author profile.'
      },
      {
        userId: author.id,
        type: NotificationType.REVIEW,
        title: 'New review on your book',
        message: 'Tapiwa Moyo left a 4-star review on Margaret Hamata: A Woman of Courage.'
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
