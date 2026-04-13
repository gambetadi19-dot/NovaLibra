import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = 'Please enter your email address.';
    }

    if (!form.password) {
      nextErrors.password = 'Please enter your password.';
    }

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      await login({ email: form.email.trim(), password: form.password });
      toast.success('Signed in.', 'Your NovaLibra session is ready.');
      navigate(location.state?.from?.pathname || '/profile');
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Login failed';
      setError(message);
      toast.error('Sign in failed.', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] shadow-[0_36px_120px_rgba(0,0,0,0.28)] lg:grid lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative hidden overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,rgba(12,10,35,0.95),rgba(8,10,24,0.95))] p-10 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.22),transparent_26%),radial-gradient(circle_at_70%_30%,rgba(244,197,96,0.08),transparent_18%)]" />
          <div className="relative">
            <p className="eyebrow">Welcome back</p>
            <h1 className="mt-5 font-display text-5xl text-white">Return to your literary space.</h1>
            <p className="mt-5 max-w-md text-sm leading-8 text-slate-300">Pick up your saved books, check notifications, reply to messages, and step back into a platform designed to feel premium at every touchpoint.</p>
            <div className="mt-10 space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-brand-gold">Demo access</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">Admin: `admin@example.com` / `password123`</p>
                <p className="text-sm leading-7 text-slate-300">Author: `author@example.com` / `password123`</p>
                <p className="text-sm leading-7 text-slate-300">Reader: `user@example.com` / `password123`</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8 lg:p-10">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-4 font-display text-4xl text-white sm:text-5xl">Sign in to your NovaLibra account.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-400">Use the seeded demo accounts or your own registered credentials.</p>
        <Alert tone="error" message={error} className="mt-6" />
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="Email"
            type="email"
            required
            error={fieldErrors.email}
            value={form.email}
            onChange={(event) => {
              const email = event.target.value;
              setForm((current) => ({ ...current, email }));
              if (fieldErrors.email) {
                setFieldErrors((current) => ({ ...current, email: '' }));
              }
              if (error) {
                setError('');
              }
            }}
          />
          <Input
            label="Password"
            type="password"
            required
            error={fieldErrors.password}
            value={form.password}
            onChange={(event) => {
              const password = event.target.value;
              setForm((current) => ({ ...current, password }));
              if (fieldErrors.password) {
                setFieldErrors((current) => ({ ...current, password: '' }));
              }
              if (error) {
                setError('');
              }
            }}
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300 lg:hidden">
          <p>Admin: `admin@example.com` / `password123`</p>
          <p>Author: `author@example.com` / `password123`</p>
          <p>Reader: `user@example.com` / `password123`</p>
        </div>
        <p className="mt-6 text-sm text-slate-400">
          No account yet?{' '}
          <Link to="/register" className="text-brand-gold">
            Create one
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
