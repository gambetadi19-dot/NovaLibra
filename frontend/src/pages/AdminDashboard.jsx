import { Activity, BellRing, BookOpenText, MessageCircle, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import EmptyState from '../components/ui/EmptyState';
import StatCard from '../components/ui/StatCard';
import Loader from '../components/ui/Loader';

const quickLinks = [
  { to: '/admin/books', label: 'Manage books' },
  { to: '/admin/messages', label: 'Inbox' },
  { to: '/admin/announcements', label: 'Announcements' },
  { to: '/admin/comments', label: 'Moderation' }
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then(({ data: response }) => setData(response))
      .catch((apiError) => {
        setError(apiError.response?.data?.message || 'Unable to load the dashboard.');
      });
  }, []);

  if (!data && !error) {
    return (
      <div className="page-shell">
        <Loader label="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <EmptyState title="Dashboard unavailable" copy={error} />
      </div>
    );
  }

  return (
    <div className="page-shell space-y-8">
      <section className="page-hero-shell overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
        <div className="absolute inset-0 hero-ambient opacity-75" />
        <div className="absolute inset-y-0 right-0 w-[42%] bg-[radial-gradient(circle_at_top_right,rgba(214,174,98,0.18),transparent_28%),radial-gradient(circle_at_70%_55%,rgba(168,85,247,0.12),transparent_24%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="max-w-3xl">
            <p className="eyebrow">Admin dashboard</p>
            <h1 className="mt-4 font-display text-5xl text-white sm:text-6xl">Run NovaLibra from a calmer, more premium control room.</h1>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Track community growth, moderate engagement, publish updates, and manage the catalog from an operations surface that feels aligned with the rest of the product.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-black/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <UsersRound className="h-5 w-5 text-brand-gold" />
                  <div>
                    <p className="text-2xl font-semibold text-white">{data.stats.totalUsers}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Members</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <BookOpenText className="h-5 w-5 text-cyan-300" />
                  <div>
                    <p className="text-2xl font-semibold text-white">{data.stats.totalBooks}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Published books</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <BellRing className="h-5 w-5 text-fuchsia-300" />
                  <div>
                    <p className="text-2xl font-semibold text-white">{data.stats.unreadNotifications}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Unread notices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,26,0.9),rgba(9,13,26,0.58))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
            <p className="eyebrow">Quick actions</p>
            <h2 className="mt-4 font-display text-3xl text-white">Jump directly into the work</h2>
            <div className="mt-6 grid gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.06]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-6 rounded-[22px] border border-white/10 bg-black/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Platform pulse</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {data.stats.totalMessages} messages, {data.stats.totalComments} comments, and {data.stats.totalReviews} reviews have moved through the platform so far.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-7">
        <StatCard label="Users" value={data.stats.totalUsers} hint="Registered readers and authors" />
        <StatCard label="Books" value={data.stats.totalBooks} hint="Published titles" />
        <StatCard label="Comments" value={data.stats.totalComments} hint="Book discussion volume" />
        <StatCard label="Unread notifications" value={data.stats.unreadNotifications} hint="Across all users" />
        <StatCard label="Messages" value={data.stats.totalMessages} hint="Inbox activity" />
        <StatCard label="Reviews" value={data.stats.totalReviews} hint="Reader review volume" />
        <StatCard label="Followers" value={data.stats.totalFollowers} hint="Author follow relationships" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="page-hero-shell overflow-hidden p-6 sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,174,98,0.08),transparent_22%)]" />
          <div className="relative">
            <p className="eyebrow">Recent users</p>
            <h2 className="mt-4 font-display text-3xl text-white">New arrivals</h2>
            <div className="mt-5 space-y-4">
              {data.activity.recentUsers.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/10 p-4">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.email}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="page-hero-shell overflow-hidden p-6 sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_22%)]" />
          <div className="relative">
            <p className="eyebrow">Recent comments</p>
            <h2 className="mt-4 font-display text-3xl text-white">Reader discussion</h2>
            <div className="mt-5 space-y-4">
              {data.activity.recentComments.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/10 p-4">
                  <p className="font-semibold text-white">
                    {item.user.name} on {item.book.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="page-hero-shell overflow-hidden p-6 sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.08),transparent_26%)]" />
          <div className="relative">
            <p className="eyebrow">Recent messages</p>
            <h2 className="mt-4 font-display text-3xl text-white">Inbox pulse</h2>
            <div className="mt-5 space-y-4">
              {data.activity.recentMessages.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/10 p-4">
                  <p className="font-semibold text-white">
                    {item.sender.name} to {item.receiver.name}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{item.subject || 'Direct message'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="page-hero-shell overflow-hidden p-6 sm:p-7 lg:col-span-2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,174,98,0.08),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.08),transparent_20%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-brand-gold" />
              <p className="eyebrow">Top books</p>
            </div>
            <h2 className="mt-4 font-display text-3xl text-white">Strongest performance indicators</h2>
            <div className="mt-5 space-y-4">
              {data.activity.topBooks.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/10 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-400">By {item.authorName}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                    <span>{item.favorites} saves</span>
                    <span>{item.comments} comments</span>
                    <span>{item.reviewCount} reviews</span>
                    <span>{item.averageRating ?? '-'} avg rating</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="page-hero-shell overflow-hidden p-6 sm:p-7 lg:col-span-2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(214,174,98,0.08),transparent_20%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-fuchsia-300" />
              <p className="eyebrow">Top authors</p>
            </div>
            <h2 className="mt-4 font-display text-3xl text-white">Growth leaders</h2>
            <div className="mt-5 space-y-4">
              {data.activity.topAuthors.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/10 p-4">
                  <p className="font-semibold text-white">{item.name}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                    <span>{item.followerCount} followers</span>
                    <span>{item.bookCount} books</span>
                    <span>{item.engagementScore} engagement score</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
