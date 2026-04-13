import { Globe, LibraryBig, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDate, initials } from '../utils/format';

export default function AuthorProfile() {
  const { authorId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [author, setAuthor] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    api
      .get(`/users/authors/${authorId}`)
      .then(({ data }) => {
        if (active) {
          setAuthor(data.author);
        }
      })
      .catch((apiError) => {
        if (active) {
          setError(apiError.response?.data?.message || 'Unable to load this author page.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [authorId]);

  async function handleFollowToggle() {
    try {
      const { data } = await api.post(`/follows/authors/${author.id}/toggle`);
      setAuthor((current) => ({
        ...current,
        isFollowing: data.following,
        _count: {
          ...current._count,
          authorFollowers: (current._count?.authorFollowers || 0) + (data.following ? 1 : -1)
        }
      }));
      toast.success(
        data.following ? 'Author followed.' : 'Author unfollowed.',
        data.following ? `You are now following ${author.name}.` : `${author.name} has been removed from your followed authors.`
      );
    } catch (apiError) {
      toast.error('Follow action failed.', apiError.response?.data?.message || 'Unable to update follow status.');
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <Loader label="Loading author page..." />
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="page-shell">
        <EmptyState title="Author unavailable" copy={error || 'This author page could not be found.'} />
      </div>
    );
  }

  return (
    <div className="page-shell space-y-10">
      <section className="panel relative overflow-hidden p-8 sm:p-10">
        <div className="absolute inset-0 bg-hero-radial opacity-70" />
        <div className="absolute inset-0 subtle-grid opacity-20" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Author page</p>
            <div className="mt-6 flex items-center gap-5">
              {author.avatarUrl ? (
                <img src={author.avatarUrl} alt={author.name} className="h-24 w-24 rounded-full border border-brand-gold/20 object-cover sm:h-28 sm:w-28" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-brand-gold/20 bg-brand-gold/10 font-display text-3xl text-brand-gold sm:h-28 sm:w-28">
                  {initials(author.name)}
                </div>
              )}
              <div>
                <h1 className="font-display text-4xl text-white sm:text-6xl">{author.name}</h1>
                <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.25em] text-brand-sand">
                  {author.role}
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">{author.bio || 'This author has not added a public biography yet.'}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">{author._count.books} published books</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                <Users className="h-4 w-4" />
                {author._count.authorFollowers || 0} followers
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">Joined {formatDate(author.createdAt)}</span>
              {author.websiteUrl ? (
                <a href={author.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 hover:text-white">
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              ) : null}
            </div>
            {isAuthenticated && user?.id !== author.id ? (
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant={author.isFollowing ? 'secondary' : 'primary'} onClick={handleFollowToggle} size="lg">
                  {author.isFollowing ? 'Following author' : 'Follow author'}
                </Button>
                <Button as={Link} to={`/messages?recipientId=${author.id}`} size="lg" variant="secondary">
                  Message {author.name}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Catalog</p>
            <h2 className="mt-4 font-display text-4xl text-white">Books by {author.name}</h2>
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {author.books.length ? (
            author.books.map((book) => (
              <article key={book.id} className="section-card transition hover:-translate-y-0.5 hover:border-white/15">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div
                    className="h-40 w-full rounded-[22px] bg-cover bg-center sm:w-32"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(6,8,22,0.08), rgba(6,8,22,0.92)), url(${book.coverImage})`
                    }}
                  />
                  <div className="flex-1">
                    <Link to={`/books/${book.slug}`} className="font-display text-3xl text-white hover:text-brand-gold">
                      {book.title}
                    </Link>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{book.shortDescription}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{book._count.favorites} saves</span>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{book._count.comments} comments</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <EmptyState
              title="No books published yet"
              copy="This author page is live, but the catalog is still being built."
              icon={<LibraryBig className="h-5 w-5" />}
            />
          )}
        </div>
      </section>
    </div>
  );
}
