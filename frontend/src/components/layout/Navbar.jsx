import { BookPlus, ChevronRight, LogOut, Menu, MessageSquareText, Shield, Sparkles, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../notifications/NotificationBell';
import { initials } from '../../utils/format';
import BrandLockup from './BrandLockup';

function navClass({ isActive }) {
  return `rounded-full px-4 py-2.5 text-sm font-semibold transition duration-300 ${isActive ? 'bg-[linear-gradient(135deg,rgba(104,64,255,0.9),rgba(182,91,235,0.7))] text-white shadow-[0_12px_32px_rgba(110,67,246,0.28)]' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'}`;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isAdmin, isAuthor, logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[linear-gradient(180deg,rgba(7,10,24,0.92),rgba(7,10,24,0.75))] backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(168,85,247,0.12),transparent_18%),radial-gradient(circle_at_85%_12%,rgba(244,197,96,0.08),transparent_14%)]" />
      <div className="container-shell relative flex items-center justify-between py-4">
        <BrandLockup size="md" className="relative z-10" />

        <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.18)] lg:flex">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>
          <NavLink to="/books" className={navClass}>
            Books
          </NavLink>
          <NavLink to="/messages" className={navClass}>
            Messages
          </NavLink>
          {isAuthor ? (
            <NavLink to="/my-books" className={navClass}>
              My Books
            </NavLink>
          ) : null}
          {isAdmin ? (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          ) : null}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Link
                to="/profile"
                className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-2 pr-4 text-sm text-white shadow-[0_10px_24px_rgba(0,0,0,0.16)] hover:bg-white/[0.08]"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/15 text-xs font-bold text-brand-gold">
                  {initials(user?.name)}
                </span>
                {user?.name?.split(' ')[0]}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm text-white hover:bg-white/[0.06]">
                Sign in
              </Link>
              <Link className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#5a2cff_0%,#8c4bff_42%,#d561da_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(124,58,237,0.32)]" to="/register">
                <Sparkles className="h-4 w-4" />
                Create account
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] shadow-[0_12px_30px_rgba(0,0,0,0.18)] lg:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(11,16,32,0.96),rgba(8,11,24,0.98))] lg:hidden">
          <div className="container-shell py-5">
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%)]" />
              <div className="relative pb-4">
                <BrandLockup size="sm" />
              </div>
              <div className="relative grid gap-3">
                <NavLink to="/" className={navClass} onClick={() => setOpen(false)}>
                  Home
                </NavLink>
                <NavLink to="/books" className={navClass} onClick={() => setOpen(false)}>
                  Books
                </NavLink>
                <NavLink to="/messages" className={navClass} onClick={() => setOpen(false)}>
                  <span className="inline-flex items-center gap-2">
                    <MessageSquareText className="h-4 w-4" />
                    Messages
                  </span>
                </NavLink>
                {isAuthenticated ? (
                  <>
                    <NavLink to="/profile" className={navClass} onClick={() => setOpen(false)}>
                      <span className="inline-flex items-center gap-2">
                        <UserRound className="h-4 w-4" />
                        Profile
                      </span>
                    </NavLink>
                    <NavLink to="/notifications" className={navClass} onClick={() => setOpen(false)}>
                      Notifications
                    </NavLink>
                    {isAuthor ? (
                      <NavLink to="/my-books" className={navClass} onClick={() => setOpen(false)}>
                        <span className="inline-flex items-center gap-2">
                          <BookPlus className="h-4 w-4" />
                          My Books
                        </span>
                      </NavLink>
                    ) : null}
                    {isAdmin ? (
                      <NavLink to="/admin" className={navClass} onClick={() => setOpen(false)}>
                        <span className="inline-flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Admin
                        </span>
                      </NavLink>
                    ) : null}
                    <button
                      type="button"
                      onClick={logout}
                      className="inline-flex items-center justify-between rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/[0.05]"
                    >
                      Sign out
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="grid gap-3 pt-2">
                    <Link
                      to="/login"
                      className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300"
                      onClick={() => setOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(135deg,#5a2cff_0%,#8c4bff_42%,#d561da_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(124,58,237,0.28)]"
                      onClick={() => setOpen(false)}
                    >
                      <Sparkles className="h-4 w-4" />
                      Create account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
