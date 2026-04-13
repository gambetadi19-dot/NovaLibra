import { Feather, LibraryBig, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const benefitPills = ['Curated discovery', 'Reader community', 'Author-ready profile'];

const platformHighlights = [
  {
    icon: LibraryBig,
    title: 'Build your reading identity',
    copy: 'Save books, follow literary voices, and shape a profile that feels considered from day one.'
  },
  {
    icon: Sparkles,
    title: 'Step into a premium community',
    copy: 'Join discussions, see platform announcements, and stay close to the stories that matter to you.'
  },
  {
    icon: Feather,
    title: 'Grow into authorship',
    copy: 'Your account is ready for future publishing, ownership, and author-facing tools as the platform expands.'
  }
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', bio: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Please enter your full name.';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Please enter your email address.';
    }

    if (!form.password) {
      nextErrors.password = 'Please create a password.';
    } else if (form.password.length < 8) {
      nextErrors.password = 'Please use at least 8 characters.';
    }

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim(), bio: form.bio.trim() });
      toast.success('Account created.', 'Your NovaLibra profile is ready to personalize.');
      navigate('/profile');
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Registration failed';
      setError(message);
      toast.error('Registration failed.', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-hero-shell overflow-hidden">
        <div className="absolute inset-0 hero-ambient opacity-90" />
        <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_top_left,rgba(214,174,98,0.18),transparent_30%),radial-gradient(circle_at_75%_20%,rgba(168,85,247,0.18),transparent_24%)]" />
        <div className="relative grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
          <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,28,0.76),rgba(10,14,28,0.38))] p-8 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
            <div className="absolute -left-12 top-10 h-32 w-32 rounded-full bg-brand-gold/10 blur-3xl" />
            <div className="absolute bottom-10 right-0 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
            <div className="relative">
              <p className="eyebrow">Join NovaLibra</p>
              <h1 className="mt-4 font-display text-5xl text-white sm:text-6xl">Create a literary profile that already feels established.</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">
                Enter the platform with a richer presence from the start. Your account is ready for discovery, thoughtful discussion, and the next layer of your reader or author journey.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.24em] text-slate-300">
                {benefitPills.map((pill) => (
                  <span key={pill} className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2">
                    {pill}
                  </span>
                ))}
              </div>
              <div className="mt-10 space-y-4">
                {platformHighlights.map(({ icon: Icon, title, copy }) => (
                  <div key={title} className="rounded-[24px] border border-white/10 bg-black/10 p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-brand-gold">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="font-display text-2xl text-white">{title}</h2>
                        <p className="mt-2 text-sm leading-7 text-slate-400">{copy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel relative p-6 sm:p-8">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Membership setup</p>
                <h2 className="mt-3 font-display text-4xl text-white">Open your account</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-300">
                Reader and author ready
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Start with the essentials now, then personalize your profile as your reading habits and creative identity evolve.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
              <Input
                label="Full name"
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
                label="Email"
                type="email"
                required
                error={fieldErrors.email}
                value={form.email}
                onChange={(event) => {
                  setForm((current) => ({ ...current, email: event.target.value }));
                  if (fieldErrors.email) {
                    setFieldErrors((current) => ({ ...current, email: '' }));
                  }
                  if (error) {
                    setError('');
                  }
                }}
              />
              <div className="md:col-span-2">
                <Input
                  label="Password"
                  type="password"
                  required
                  error={fieldErrors.password}
                  hint="Use at least 8 characters."
                  value={form.password}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, password: event.target.value }));
                    if (fieldErrors.password) {
                      setFieldErrors((current) => ({ ...current, password: '' }));
                    }
                    if (error) {
                      setError('');
                    }
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Bio"
                  textarea
                  rows={5}
                  value={form.bio}
                  hint="Optional. Share your genres, literary interests, or creative direction."
                  onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                />
              </div>
              <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating account...' : 'Create account'}
                </Button>
                <span className="text-xs uppercase tracking-[0.22em] text-slate-500">Elegant setup. No clutter.</span>
              </div>
            </form>
            {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
            <p className="mt-8 text-sm text-slate-400">
              Already a member?{' '}
              <Link to="/login" className="text-brand-gold">
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
