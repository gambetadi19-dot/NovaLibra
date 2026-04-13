import { BellRing, BookHeart, MessageSquareReply, Megaphone, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationNavigation } from '../hooks/useNotificationNavigation';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import { formatDate } from '../utils/format';

export default function Notifications() {
  const { notifications, unreadCount, connected, loading, error, markAsRead, markAllAsRead } = useNotifications();
  const { openNotification } = useNotificationNavigation();

  function getNotificationMeta(notification) {
    if (notification.type === 'ANNOUNCEMENT') {
      return { icon: <Megaphone className="h-4 w-4" />, label: 'Announcement', accent: 'text-brand-gold' };
    }

    if (notification.type === 'COMMENT_REPLY') {
      return { icon: <MessageSquareReply className="h-4 w-4" />, label: 'Reply', accent: 'text-cyan-300' };
    }

    if (notification.type === 'FOLLOW') {
      return { icon: <Sparkles className="h-4 w-4" />, label: 'Follower', accent: 'text-fuchsia-300' };
    }

    if (notification.type === 'REVIEW') {
      return { icon: <BookHeart className="h-4 w-4" />, label: 'Review', accent: 'text-emerald-300' };
    }

    if (notification.type === 'SYSTEM') {
      return { icon: <BookHeart className="h-4 w-4" />, label: 'Engagement', accent: 'text-slate-300' };
    }

    return { icon: <Sparkles className="h-4 w-4" />, label: 'Update', accent: 'text-slate-300' };
  }

  return (
    <div className="page-shell space-y-8">
      <section className="page-hero-shell overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
        <div className="absolute inset-0 hero-ambient opacity-80" />
        <div className="absolute inset-y-0 right-0 w-[45%] bg-[radial-gradient(circle_at_top_right,rgba(214,174,98,0.16),transparent_28%),radial-gradient(circle_at_70%_55%,rgba(56,189,248,0.12),transparent_24%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Notifications</p>
            <h1 className="mt-4 font-display text-5xl text-white sm:text-6xl">Realtime updates, presented with more calm and signal.</h1>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Follow replies, announcements, reviews, and community movement without the page feeling noisy. Important moments stay visible and easy to act on.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-200">
                {unreadCount} unread
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-200">
                {notifications.length} total updates
              </span>
              <span className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] uppercase tracking-[0.24em] ${connected ? 'text-emerald-300' : 'text-slate-400'}`}>
                {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                {connected ? 'Live connection' : 'Offline mode'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            className="rounded-full border border-white/10 bg-[linear-gradient(135deg,rgba(214,174,98,0.22),rgba(255,255,255,0.06))] px-5 py-3 text-sm text-brand-sand transition hover:-translate-y-0.5 hover:border-brand-gold/40 hover:bg-[linear-gradient(135deg,rgba(214,174,98,0.28),rgba(255,255,255,0.08))]"
          >
            Mark all as read
          </button>
        </div>
      </section>

      <div className="space-y-4">
        {loading ? (
          <Loader label="Loading notifications..." />
        ) : error ? (
          <EmptyState title="Notifications unavailable" copy={error} />
        ) : notifications.length ? (
          notifications.map((notification) => {
            const meta = getNotificationMeta(notification);

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() =>
                  openNotification(notification, {
                    onMarkedRead: async () => {
                      if (!notification.isRead) {
                        await markAsRead(notification.id);
                      }
                    }
                  })
                }
                className={`page-hero-shell block w-full overflow-hidden px-6 py-6 text-left transition duration-300 hover:-translate-y-0.5 hover:border-white/15 ${notification.isRead ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.025))]' : 'bg-[linear-gradient(180deg,rgba(214,174,98,0.14),rgba(255,255,255,0.035))]'}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_18%)]" />
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] ${meta.accent}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                      {!notification.isRead ? (
                        <span className="rounded-full border border-brand-gold/30 bg-brand-gold/12 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-brand-sand">
                          New
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-4 font-display text-3xl text-white">{notification.title}</p>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{notification.message}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-black/10 px-4 py-3 text-right backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Received</p>
                    <p className="mt-2 text-sm text-slate-200">{formatDate(notification.createdAt)}</p>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <EmptyState
            title="No notifications yet"
            copy="Notifications from replies, announcements, and messages will appear here."
            icon={<BellRing className="h-5 w-5" />}
          />
        )}
      </div>
    </div>
  );
}
