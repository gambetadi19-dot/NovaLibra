import { Bell, BookHeart, CheckCheck, CircleDot, Megaphone, MessageSquareReply, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationNavigation } from '../../hooks/useNotificationNavigation';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDate } from '../../utils/format';
import EmptyState from '../ui/EmptyState';
import Loader from '../ui/Loader';

export default function NotificationBell() {
  const { notifications, unreadCount, loading, error, markAllAsRead, markAsRead } = useNotifications();
  const { openNotification } = useNotificationNavigation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleMarkAllAsRead() {
    if (!notifications.length || unreadCount === 0 || busy) {
      return;
    }

    setBusy(true);
    try {
      await markAllAsRead();
    } finally {
      setBusy(false);
    }
  }

  async function handleMarkAsRead(notificationId) {
    setBusy(true);
    try {
      await markAsRead(notificationId);
    } finally {
      setBusy(false);
    }
  }

  function getNotificationMeta(notification) {
    if (notification.type === 'ANNOUNCEMENT') {
      return { icon: <Megaphone className="h-3.5 w-3.5" />, label: 'Announcement' };
    }

    if (notification.type === 'COMMENT_REPLY') {
      return { icon: <MessageSquareReply className="h-3.5 w-3.5" />, label: 'Reply' };
    }

    if (notification.type === 'SYSTEM') {
      return { icon: <BookHeart className="h-3.5 w-3.5" />, label: 'Engagement' };
    }

    return { icon: <Sparkles className="h-3.5 w-3.5" />, label: 'Update' };
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white shadow-[0_10px_24px_rgba(0,0,0,0.16)] hover:bg-white/[0.08]"
      >
        <Bell className="h-5 w-5" />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 min-w-[1.4rem] rounded-full bg-brand-gold px-1.5 py-0.5 text-center text-[10px] font-bold text-brand-950 shadow-[0_10px_24px_rgba(214,174,98,0.25)]">
            {unreadCount}
          </span>
        ) : null}
      </button>

      <div
        className={`absolute right-0 top-14 z-20 w-[24rem] max-w-[calc(100vw-1rem)] rounded-[28px] border border-white/10 bg-brand-900/95 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.34)] transition duration-200 sm:max-w-[calc(100vw-2rem)] ${open ? 'visible translate-y-0 opacity-100' : 'invisible pointer-events-none translate-y-2 opacity-0'}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Notifications</p>
            <p className="mt-2 text-sm text-slate-400">
              {unreadCount ? `${unreadCount} unread updates waiting for you.` : 'Realtime activity for announcements, replies, and messages.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={!notifications.length || unreadCount === 0 || busy}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-brand-sand transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            {busy ? 'Saving...' : 'Read all'}
          </button>
        </div>

        <div className="mt-4 max-h-[24rem] space-y-3 overflow-y-auto pr-1">
          {loading ? (
            <Loader label="Loading notifications..." compact />
          ) : error ? (
            <EmptyState title="Notifications unavailable" copy={error} className="px-4 py-8" />
          ) : notifications.length ? (
            notifications.slice(0, 4).map((item) => (
              (() => {
                const meta = getNotificationMeta(item);
                return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  openNotification(item, {
                    onMarkedRead: async () => {
                      if (!item.isRead) {
                        await handleMarkAsRead(item.id);
                      }
                      setOpen(false);
                    }
                  })
                }
                className={`block w-full rounded-[22px] border px-4 py-3 text-left transition hover:border-white/15 hover:bg-white/[0.05] ${item.isRead ? 'border-white/5 bg-white/[0.03]' : 'border-brand-gold/30 bg-brand-gold/10'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!item.isRead ? <CircleDot className="h-3.5 w-3.5 shrink-0 text-brand-gold" /> : null}
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                        {meta.icon}
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{item.message}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {!item.isRead ? (
                      <span className="mb-2 inline-flex rounded-full border border-brand-gold/20 bg-brand-gold/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                        New
                      </span>
                    ) : null}
                    <span className="block text-xs text-slate-400">{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </button>
                );
              })()
            ))
          ) : (
            <EmptyState title="No notifications yet" copy="New replies, announcements, and messages will land here." className="px-4 py-8" />
          )}
        </div>

        <div className="mt-4">
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-brand-sand hover:bg-white/[0.06]"
          >
            View all notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
