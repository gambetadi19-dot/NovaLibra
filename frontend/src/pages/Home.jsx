import { ArrowRight, BookMarked, MessageCircleHeart, Radio, Search, Sparkles, Star, PenTool, BellRing, Users, LibraryBig } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import BookCard from '../components/books/BookCard';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import SectionHeading from '../components/ui/SectionHeading';
import { SkeletonCard, SkeletonList } from '../components/ui/Skeleton';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [featuredAuthors, setFeaturedAuthors] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setError('');
    Promise.all([api.get('/books'), api.get('/users/authors?featured=true'), api.get('/announcements')])
      .then(([booksResponse, authorsResponse, announcementsResponse]) => {
        setBooks(booksResponse.data.books);
        setFeaturedAuthors(authorsResponse.data.authors || []);
        setAnnouncements(announcementsResponse.data.announcements);
      })
      .catch((apiError) => {
        setError(apiError.response?.data?.message || 'Unable to load homepage content.');
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleFavorite(bookId) {
    if (!isAuthenticated) {
      return;
    }

    const { data } = await api.post(`/favorites/${bookId}/toggle`);
    setBooks((current) =>
      current.map((book) =>
        book.id === bookId
          ? {
              ...book,
              isFavorited: data.favorited,
              _count: {
                ...book._count,
                favorites: (book._count?.favorites || 0) + (data.favorited ? 1 : -1)
              }
            }
          : book
      )
    );
  }

  useEffect(() => {
    if (!announcements.length) {
      return;
    }

    const announcementId = searchParams.get('announcement');
    if (!announcementId) {
      return;
    }

    const timer = window.setTimeout(() => {
      document.getElementById(`announcement-${announcementId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [announcements, searchParams]);

  const featuredBooks = books.filter((book) => book.isFeatured).slice(0, 3);
  const heroStats = [
    { label: 'Books in motion', value: books.length ? `${books.length}+` : 'Curated' },
    { label: 'Featured authors', value: featuredAuthors.length ? `${featuredAuthors.length}+` : 'Growing' },
    { label: 'Platform notes', value: announcements.length ? `${announcements.length}` : 'Live' },
    { label: 'Community pulse', value: 'Realtime' }
  ];
  const experienceCards = [
    {
      title: 'Discover & Explore',
      copy: 'Browse a literary catalog with curated genres, elegant book pages, and stronger paths into the right stories.',
      cta: 'Start discovering',
      icon: LibraryBig,
      accent: 'from-fuchsia-500/24 via-violet-500/8 to-transparent'
    },
    {
      title: 'Connect & Discuss',
      copy: 'Threaded conversations, author presence, and meaningful reader exchange keep each book feeling alive.',
      cta: 'Join discussions',
      icon: Users,
      accent: 'from-emerald-400/22 via-cyan-500/8 to-transparent'
    },
    {
      title: 'Publish & Grow',
      copy: 'Authors get room to present, publish, and develop a presence that feels premium instead of improvised.',
      cta: 'Build your shelf',
      icon: PenTool,
      accent: 'from-amber-400/24 via-orange-500/8 to-transparent'
    },
    {
      title: 'Stay Updated',
      copy: 'Announcements, notifications, and messaging keep the platform active and close to the people using it.',
      cta: 'Follow updates',
      icon: BellRing,
      accent: 'from-blue-500/24 via-indigo-500/8 to-transparent'
    }
  ];

  return (
    <div className="overflow-hidden">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="hero-ambient absolute inset-0" />
        <div className="absolute inset-0 subtle-grid opacity-[0.12]" />
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-fuchsia-600/14 blur-[130px]" />
        <div className="absolute right-0 top-0 h-[32rem] w-[32rem] rounded-full bg-violet-600/18 blur-[160px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-[130px]" />

        <div className="container-shell relative py-16 sm:py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/18 bg-fuchsia-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.34em] text-brand-sand shadow-[0_10px_24px_rgba(75,0,130,0.18)]">
                <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
                Where stories live longer
              </div>
              <h1 className="mt-8 font-display text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-[5.4rem]">
                A literary home
                <br />
                for{' '}
                <span className="bg-[linear-gradient(135deg,#f3ecff_0%,#cc98ff_35%,#a56cf5_62%,#f2cb7d_100%)] bg-clip-text text-transparent">
                  authors & readers
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-300 sm:text-[1.15rem]">
                Discover extraordinary books, connect with passionate authors, save the stories that stay with you, and step into a platform built to feel luminous, editorial, and alive.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Button as={Link} to="/books" size="lg" className="rounded-[22px] bg-[linear-gradient(135deg,#5a2cff_0%,#8c4bff_42%,#d561da_100%)] px-7 text-white shadow-[0_22px_45px_rgba(124,58,237,0.32)] hover:bg-[linear-gradient(135deg,#6a3eff_0%,#9a5cff_42%,#db74df_100%)]">
                  <BookMarked className="h-4.5 w-4.5" />
                  Explore Books
                </Button>
                <Button as={Link} to="/register" variant="secondary" size="lg" className="rounded-[22px] border-white/12 bg-brand-900/65 px-7 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
                  <Sparkles className="h-4.5 w-4.5 text-brand-gold" />
                  Create Account
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-5 rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl">
                <div className="flex -space-x-3">
                  {['bg-amber-300', 'bg-emerald-300', 'bg-fuchsia-300', 'bg-sky-300'].map((tone, index) => (
                    <span
                      key={tone}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-brand-950 ${tone} text-xs font-bold text-brand-950 shadow-[0_10px_20px_rgba(0,0,0,0.18)]`}
                    >
                      {index + 1}
                    </span>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-brand-gold">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-slate-300">Built for readers, authors, and a platform that wants to feel unforgettable.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-brand-gold/18 blur-3xl animate-pulse-soft" />
              <div className="absolute right-10 top-20 h-36 w-36 rounded-full bg-violet-500/18 blur-[90px] animate-float-slow" />
              <div className="hero-stage panel relative min-h-[560px] overflow-hidden rounded-[38px] border-white/12 bg-[linear-gradient(180deg,rgba(10,9,30,0.96),rgba(9,10,24,0.92))] p-6 shadow-[0_35px_120px_rgba(4,6,20,0.55)] sm:p-8">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-[0.84]"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(8,9,26,0.16), rgba(8,9,26,0.44) 36%, rgba(8,9,26,0.8) 100%), url('/hero-artwork-v1.png')"
                  }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,rgba(160,96,255,0.24),transparent_24%),radial-gradient(circle_at_62%_58%,rgba(255,193,96,0.12),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_44%)]" />
                <div className="absolute inset-x-14 bottom-0 h-28 rounded-full bg-violet-500/14 blur-[70px]" />
                <div className="absolute right-[-8%] top-[16%] h-[62%] w-[48%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.32),transparent_62%)] blur-[55px]" />

                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-[26px] border border-white/10 bg-white/[0.045] px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-200/90">Platform Highlights</p>
                      <p className="mt-2 font-display text-2xl text-white">Premium presence, not template energy.</p>
                    </div>
                    <div className="float-slow rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-3 text-right shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Live right now</p>
                      <p className="mt-2 text-lg font-semibold text-white">Discovery, messages, discussion</p>
                    </div>
                  </div>

                  <div className="relative mx-auto mt-8 flex w-full max-w-[28rem] flex-1 items-center justify-center">
                    <div className="absolute inset-x-14 top-6 h-12 rounded-full bg-violet-500/20 blur-2xl animate-pulse-soft" />
                    <div className="absolute inset-x-10 bottom-12 h-10 rounded-full bg-brand-gold/16 blur-2xl" />
                    <div className="absolute left-4 top-24 float-delayed rounded-[24px] border border-white/10 bg-black/34 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/90">Author space</p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">Books belong to real creators, with room to publish, grow, and connect.</p>
                    </div>
                    <div className="absolute right-0 top-36 animate-float-slow rounded-[24px] border border-white/10 bg-black/34 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-brand-gold">Reader loop</p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">Browse, save, discuss, return.</p>
                    </div>

                    <div className="relative mt-20 flex h-[22rem] w-[22rem] items-end justify-center">
                      <div className="absolute bottom-4 h-8 w-64 rounded-full bg-black/35 blur-2xl" />
                      <div className="absolute left-6 bottom-14 h-44 w-20 rounded-t-[1.8rem] rounded-b-[0.9rem] border border-fuchsia-300/20 bg-[linear-gradient(180deg,rgba(70,20,96,0.5),rgba(34,14,56,0.88))] shadow-[0_16px_40px_rgba(0,0,0,0.35)]" />
                      <div className="absolute left-[5.35rem] bottom-14 h-56 w-24 rounded-t-[1.9rem] rounded-b-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,54,0.95),rgba(11,18,36,0.95))] shadow-[0_16px_40px_rgba(0,0,0,0.35)]" />
                      <div className="absolute left-[12.2rem] bottom-12 rotate-[12deg] h-52 w-24 rounded-t-[1.7rem] rounded-b-[1rem] border border-brand-gold/20 bg-[linear-gradient(180deg,rgba(70,46,14,0.92),rgba(31,24,13,0.96))] shadow-[0_16px_40px_rgba(0,0,0,0.35)]" />
                      <div className="absolute bottom-0 h-3 w-[19rem] rounded-full bg-[linear-gradient(90deg,rgba(72,187,255,0.8),rgba(179,110,255,0.85),rgba(244,197,96,0.78))]" />
                      <div className="absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-full bg-violet-500/14 blur-3xl" />
                      <div className="hero-logo-badge relative z-10 flex h-28 w-28 items-center justify-center rounded-[2rem] border border-brand-gold/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_24px_55px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                        <img src="/logo-v2.png" alt="NovaLibra logo" className="h-16 w-16 object-contain drop-shadow-[0_10px_25px_rgba(214,174,98,0.22)]" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                      <BookMarked className="h-5 w-5 text-brand-gold" />
                      <p className="mt-3 text-sm font-semibold text-white">Curated shelves</p>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                      <MessageCircleHeart className="h-5 w-5 text-fuchsia-300" />
                      <p className="mt-3 text-sm font-semibold text-white">Living discussion</p>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                      <Radio className="h-5 w-5 text-cyan-300" />
                      <p className="mt-3 text-sm font-semibold text-white">Realtime platform pulse</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 rounded-[32px] border border-white/10 bg-white/[0.035] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:grid-cols-2 xl:grid-cols-4">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-[24px] border border-white/8 bg-black/10 px-5 py-4">
                <p className="text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Platform Highlights"
            title="Everything you need to love books more."
            copy="NovaLibra brings together discovery, author presence, messaging, and discussion in a cinematic experience designed to feel high-end from the first scroll."
            align="center"
          />

          <div className="mt-12 grid gap-6 xl:grid-cols-4">
            {experienceCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.2)] transition duration-500 hover:-translate-y-1.5 hover:border-white/16"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-90 transition duration-500 group-hover:scale-105`} />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_45%)]" />
                  <div className="relative">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/10 bg-black/20 text-white shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-10 text-2xl font-semibold text-white">{card.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{card.copy}</p>
                    <p className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-sand transition duration-300 group-hover:translate-x-1">
                      {card.cta}
                      <ArrowRight className="h-4 w-4" />
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/10">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Featured Books"
            title="A showcase built to turn curiosity into intentional discovery."
            copy="Featured placements now reflect editorial curation, making it easier for readers to begin with the titles NovaLibra most wants to foreground."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)
            ) : error ? (
              <EmptyState title="Catalog unavailable" copy={error} />
            ) : featuredBooks.length ? (
              featuredBooks.map((book) => <BookCard key={book.id} book={book} onFavorite={handleFavorite} />)
            ) : (
              <EmptyState title="No books yet" copy="Add the first title from the admin dashboard to begin shaping the platform catalog." />
            )}
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/10">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Featured Authors"
            title="Authors with a stronger public presence lead discovery."
            copy="Curated author placements help readers move from a single book page into a fuller creative identity."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={`author-${index}`} />)
            ) : featuredAuthors.length ? (
              featuredAuthors.slice(0, 3).map((author) => (
                <article key={author.id} className="section-card relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_68%)]" />
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-brand-sand">
                      <Star className="h-3.5 w-3.5" />
                      Featured author
                    </span>
                    <span className="text-xs uppercase tracking-[0.24em] text-slate-500">{author._count.books} books</span>
                  </div>
                  <h3 className="mt-5 font-display text-3xl text-white">{author.name}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{author.bio || 'This author is building a growing NovaLibra presence.'}</p>
                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">Author profile</span>
                    {author.websiteUrl ? <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">Website available</span> : null}
                  </div>
                  <div className="mt-6">
                    <Button as={Link} to={`/authors/${author.id}`} variant="secondary">
                      View author page
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="No featured authors yet" copy="Mark authors as featured from the admin user directory to build this discovery lane." />
            )}
          </div>
        </div>
      </section>

      <section id="announcements" className="border-y border-white/10 bg-white/[0.02] scroll-mt-24">
        <div className="container-shell py-20">
          <SectionHeading
            eyebrow="Announcements"
            title="The community stays connected beyond the book page."
            copy="Platform updates and publishing notes appear here and trigger realtime notifications for signed-in members."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {loading ? (
              <SkeletonList count={2} />
            ) : announcements.length ? (
              announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  id={`announcement-${announcement.id}`}
                  className={`panel p-7 transition ${
                    String(announcement.id) === searchParams.get('announcement')
                      ? 'border-brand-gold/40 shadow-[0_20px_60px_rgba(214,174,98,0.14)]'
                      : ''
                  }`}
                >
                  <p className="eyebrow">Latest update</p>
                  <h3 className="mt-4 font-display text-4xl text-white">{announcement.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{announcement.content}</p>
                </article>
              ))
            ) : (
              <EmptyState title="No announcements yet" copy="Announcements published by the admin will appear here." />
            )}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell">
          <div className="panel relative flex flex-col gap-6 overflow-hidden p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-fuchsia-500/14 blur-[95px]" />
            <div>
              <p className="eyebrow">Built for extension</p>
              <h2 className="mt-4 font-display text-4xl text-white">This foundation is built like a platform MVP, not a dead-end prototype.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                JWT auth, Prisma models, admin routes, modular controllers, reusable React pages, and Socket.IO hooks make the project straightforward to extend into author tools, events, newsletters, subscriptions, or richer community features later.
              </p>
            </div>
            <Button as={Link} to="/admin" variant="secondary" className="self-start lg:self-center">
              View platform controls
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
