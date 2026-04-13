import { useEffect, useState } from 'react';
import { CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';
import { SkeletonBlock } from '../components/ui/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDate, initials } from '../utils/format';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', bio: '', avatarUrl: '', websiteUrl: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { updateUser, user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    api
      .get('/users/me/profile')
      .then(({ data }) => {
        if (!active) {
          return;
        }

        setProfile(data.profile);
        setForm({
          name: data.profile.name,
          bio: data.profile.bio || '',
          avatarUrl: data.profile.avatarUrl || '',
          websiteUrl: data.profile.websiteUrl || ''
        });
      })
      .catch((apiError) => {
        if (active) {
          setError(apiError.response?.data?.message || 'Unable to load your profile.');
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
  }, [user?.id]);

  async function handleSave(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Name is required.';
    }

    if (form.avatarUrl && !/^https?:\/\//i.test(form.avatarUrl)) {
      nextErrors.avatarUrl = 'Use a full URL starting with http:// or https://';
    }

    if (form.websiteUrl && !/^https?:\/\//i.test(form.websiteUrl)) {
      nextErrors.websiteUrl = 'Use a full URL starting with http:// or https://';
    }

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    setSaving(true);
    setError('');
    setFieldErrors({});

    try {
      const profileInput = {
        name: form.name.trim(),
        bio: form.bio.trim(),
        avatarUrl: form.avatarUrl.trim(),
        websiteUrl: form.websiteUrl.trim()
      };
      const { data } = await api.patch('/users/me/profile', profileInput);
      setProfile((current) => ({ ...current, ...data.profile }));
      updateUser(data.profile);
      toast.success('Profile saved.', 'Your changes are live across the app.');
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to save profile changes.';
      setError(message);
      toast.error('Profile update failed.', message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="section-card space-y-5">
            <SkeletonBlock className="h-24 w-24 rounded-full" />
            <SkeletonBlock className="h-10 w-2/3" />
            <SkeletonBlock className="h-5 w-24" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
          </div>
          <Loader label="Loading profile..." />
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="page-shell">
        <EmptyState title="Profile unavailable" copy={error} />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="page-hero-shell p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-brand-gold/10 blur-3xl" />
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="h-24 w-24 rounded-full border border-brand-gold/20 object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-brand-gold/20 bg-brand-gold/10 font-display text-3xl text-brand-gold">
              {initials(profile.name)}
            </div>
          )}
          <h1 className="mt-6 break-words font-display text-4xl text-white sm:text-5xl">{profile.name}</h1>
          <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm uppercase tracking-[0.25em] text-slate-400">
            {profile.role}
          </p>
          {profile.role === 'AUTHOR' ? (
            <p className="mt-4 max-w-xl text-sm leading-7 text-brand-sand">
              Your public author identity is now live. Readers can discover your profile from your books and follow your growing catalog.
            </p>
          ) : null}
          <p className="mt-6 text-sm leading-7 text-slate-300">{profile.bio || 'No bio added yet.'}</p>
          {profile.websiteUrl ? (
            <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm text-brand-gold hover:text-brand-sand">
              <Globe className="h-4 w-4" />
              Visit website
            </a>
          ) : null}
          <p className="mt-6 text-xs uppercase tracking-[0.28em] text-slate-500">Joined {formatDate(profile.createdAt)}</p>
          {profile.role === 'AUTHOR' ? (
            <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-slate-500">
              <span>{profile._count?.authorFollowers || 0} followers</span>
              <span>{profile.reviews?.length || 0} recent reviews</span>
            </div>
          ) : null}

          <div className="mt-8">
            <p className="eyebrow">Favorite books</p>
            <div className="mt-4 space-y-3">
              {profile.favorites.length ? (
                profile.favorites.map((favorite) => (
                  <div key={favorite.id} className="rounded-[22px] border border-white/10 bg-black/10 p-4 shadow-[0_16px_35px_rgba(0,0,0,0.14)]">
                    <p className="font-semibold text-white">{favorite.book.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{favorite.book.shortDescription}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-white/15 px-4 py-6 text-sm text-slate-400">
                  No favorite books yet.
                </div>
              )}
            </div>
          </div>

          {profile.role === 'AUTHOR' && profile.books?.length ? (
            <div className="mt-8">
              <p className="eyebrow">Authored books</p>
              <div className="mt-4 space-y-3">
                {profile.books.map((book) => (
                  <div key={book.id} className="rounded-[22px] border border-white/10 bg-black/10 p-4 shadow-[0_16px_35px_rgba(0,0,0,0.14)]">
                    <Link to={`/books/${book.slug}`} className="font-semibold text-white hover:text-brand-gold">
                      {book.title}
                    </Link>
                    <p className="mt-1 text-sm text-slate-400">{book.shortDescription}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                      <span>{book._count?.favorites || 0} saves</span>
                      <span>{book._count?.comments || 0} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <div className="space-y-8">
          <section className="page-hero-shell p-6 sm:p-8">
            <p className="eyebrow">Edit profile</p>
            <h2 className="mt-4 font-display text-4xl text-white">
              {profile.role === 'AUTHOR' ? 'Shape your public author presence.' : 'Shape your literary presence.'}
            </h2>
            {profile.role === 'AUTHOR' ? (
              <div className="mt-4 rounded-[22px] border border-brand-gold/20 bg-brand-gold/10 p-4 text-sm leading-7 text-brand-sand">
                <span className="inline-flex items-center gap-2 font-semibold text-white">
                  <Sparkles className="h-4 w-4 text-brand-gold" />
                  Public author page enabled
                </span>
                <p className="mt-2">
                  Keep your bio, image, and website current so readers feel like they are meeting a real writer rather than browsing an account record.
                </p>
              </div>
            ) : null}
            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <Input
                label="Name"
                required
                error={fieldErrors.name}
                value={form.name}
                onChange={(event) => {
                  setForm((current) => ({ ...current, name: event.target.value }));
                  if (fieldErrors.name) {
                    setFieldErrors((current) => ({ ...current, name: '' }));
                  }
                  if (error) {
                    setError('');
                  }
                }}
              />
              <Input
                label="Avatar URL"
                error={fieldErrors.avatarUrl}
                hint="Optional. Add a public image URL for your profile picture."
                value={form.avatarUrl}
                onChange={(event) => {
                  setForm((current) => ({ ...current, avatarUrl: event.target.value }));
                  if (fieldErrors.avatarUrl) {
                    setFieldErrors((current) => ({ ...current, avatarUrl: '' }));
                  }
                  if (error) {
                    setError('');
                  }
                }}
              />
              <Input
                label="Bio"
                textarea
                rows={5}
                hint={`${form.bio.trim().length}/280 characters`}
                maxLength={280}
                value={form.bio}
                onChange={(event) => {
                  setForm((current) => ({ ...current, bio: event.target.value }));
                  if (error) {
                    setError('');
                  }
                }}
              />
              {profile.role === 'AUTHOR' ? (
                <Input
                  label="Website URL"
                  error={fieldErrors.websiteUrl}
                  hint="Optional. Add a public site or portfolio link for your author page."
                  value={form.websiteUrl}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, websiteUrl: event.target.value }));
                    if (fieldErrors.websiteUrl) {
                      setFieldErrors((current) => ({ ...current, websiteUrl: '' }));
                    }
                    if (error) {
                      setError('');
                    }
                  }}
                />
              ) : null}
              <Button type="submit" disabled={saving} size="lg">{saving ? 'Saving...' : 'Save profile'}</Button>
            </form>
          </section>

          <section className="page-hero-shell p-6 sm:p-8">
            <p className="eyebrow">Recent activity</p>
            <h2 className="mt-4 font-display text-4xl text-white">Your latest reading moments.</h2>
            <div className="mt-6 space-y-4">
              {profile.comments.length ? (
                profile.comments.map((comment) => (
                  <div key={comment.id} className="rounded-[22px] border border-white/10 bg-black/10 p-4 shadow-[0_16px_35px_rgba(0,0,0,0.14)]">
                    <p className="font-semibold text-white">{comment.book.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{comment.content}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">{formatDate(comment.createdAt)}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No recent activity yet"
                  copy="Comment on a book or save a favourite title to start building your activity history."
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  className="px-4 py-8"
                />
              )}
            </div>
          </section>

          {profile.role === 'AUTHOR' ? (
            <section className="page-hero-shell p-6 sm:p-8">
              <p className="eyebrow">Growth view</p>
              <h2 className="mt-4 font-display text-4xl text-white">Track your author momentum.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Open the analytics workspace to see follower growth, review volume, ratings, and which books are performing strongest.
              </p>
              <div className="mt-6">
                <Button as={Link} to="/author-analytics" size="lg">
                  Open author analytics
                </Button>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
