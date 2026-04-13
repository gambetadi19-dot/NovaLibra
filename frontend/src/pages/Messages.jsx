import { MessageCircleMore, Send, Users2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import MessageComposer from '../components/messages/MessageComposer';
import MessageList from '../components/messages/MessageList';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/Skeleton';
import { useAuth } from '../hooks/useAuth';

export default function Messages() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [adminContact, setAdminContact] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError('');

    const requests = [api.get('/messages'), api.get('/users/admin-contact'), api.get('/users/authors')];

    Promise.all(requests)
      .then(([messageResponse, adminResponse, authorResponse]) => {
        setMessages(messageResponse.data.messages);
        if (adminResponse?.data?.admin) {
          setAdminContact(adminResponse.data.admin);
        }
        setAuthors(authorResponse?.data?.authors || []);
      })
      .catch((apiError) => {
        setError(apiError.response?.data?.message || 'Unable to load messages.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const requestedRecipient = Number(searchParams.get('recipientId'));
    if (requestedRecipient) {
      setSelectedRecipientId(requestedRecipient);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedRecipientId || !adminContact || user?.role === 'ADMIN') {
      return;
    }

    setSelectedRecipientId(adminContact.id);
  }, [adminContact, selectedRecipientId, user?.role]);

  async function handleSend(messageInput) {
    const { data } = await api.post('/messages', messageInput);
    setMessages((current) => [data.message, ...current]);
  }

  useEffect(() => {
    if (!user?.id || !messages.length) {
      return;
    }

    const unreadIncomingIds = messages
      .filter((message) => message.receiverId === user.id && message.status === 'UNREAD')
      .map((message) => message.id);

    if (!unreadIncomingIds.length) {
      return;
    }

    let active = true;

    Promise.allSettled(unreadIncomingIds.map((messageId) => api.patch(`/messages/${messageId}/read`))).then(() => {
      if (!active) {
        return;
      }

      setMessages((current) =>
        current.map((message) =>
          unreadIncomingIds.includes(message.id)
            ? {
                ...message,
                status: 'READ'
              }
            : message
        )
      );
    });

    return () => {
      active = false;
    };
  }, [messages, user?.id]);

  useEffect(() => {
    const messageId = searchParams.get('messageId');
    if (!messageId || !messages.length) {
      return;
    }

    const timer = window.setTimeout(() => {
      document.getElementById(`message-${messageId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [messages, searchParams]);

  const canCompose = user?.role !== 'ADMIN';
  const recipients = [adminContact, ...authors]
    .filter(Boolean)
    .filter((recipient, index, list) => list.findIndex((entry) => entry.id === recipient.id) === index)
    .filter((recipient) => recipient.id !== user?.id);
  const selectedRecipient = recipients.find((recipient) => recipient.id === selectedRecipientId) || null;
  const inboxMessages = messages.filter((message) => message.receiverId === user?.id);
  const sentMessages = messages.filter((message) => message.senderId === user?.id);
  const unreadCount = inboxMessages.filter((message) => message.status === 'UNREAD').length;

  return (
    <div className="page-shell space-y-8">
      <section className="page-hero-shell overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
        <div className="absolute inset-0 hero-ambient opacity-90" />
        <div className="absolute inset-y-0 right-0 w-[48%] bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_28%),radial-gradient(circle_at_70%_60%,rgba(214,174,98,0.14),transparent_30%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="max-w-3xl">
            <p className="eyebrow">Direct messages</p>
            <h1 className="mt-4 font-display text-5xl text-white sm:text-6xl">Keep the platform conversation personal, polished, and easy to follow.</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">
              Reach the platform team when you need support, or write directly to authors when a book sparks a thoughtful question, invitation, or note worth sending with care.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-black/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-brand-gold">
                    <Users2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-semibold text-white">{recipients.filter((recipient) => recipient.role === 'AUTHOR').length}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Authors available</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-cyan-300">
                    <MessageCircleMore className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-semibold text-white">{unreadCount}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Unread messages</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-fuchsia-300">
                    <Send className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-semibold text-white">{sentMessages.length}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Sent so far</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,26,0.9),rgba(9,13,26,0.58))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
            <p className="eyebrow">Conversation style</p>
            <h2 className="mt-4 font-display text-3xl text-white">Designed for warm, one-to-one contact</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Use the inbox as a relationship surface, not just a utility. Clear recipients, calm pacing, and polished threads keep every exchange feeling intentional.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3">Support requests route cleanly through the platform team.</div>
              <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3">Author outreach stays visible and easy to continue later.</div>
              <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3">Unread tracking keeps follow-up from slipping through.</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
        <section className="panel p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Compose</p>
              <h2 className="mt-3 font-display text-4xl text-white">Start a new note</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-300">
              {selectedRecipient?.name || 'Select a recipient'}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            Contact stays focused and intentional here, with authors listed alongside the platform team so outreach never feels cluttered.
          </p>
          <div className="mt-8">
            {canCompose ? (
              <MessageComposer
                onSubmit={handleSend}
                receiverId={selectedRecipient?.id || null}
                recipientLabel={selectedRecipient?.name || 'your selected recipient'}
                recipients={recipients}
                onRecipientChange={setSelectedRecipientId}
                recipientHint="Authors are listed alongside the platform team so contact stays clear and intentional."
              />
            ) : (
              <EmptyState
                title="Admin inbox mode"
                copy="Use this page to review all messages. Admin replies are handled from the dedicated admin inbox."
              />
            )}
          </div>
        </section>

        <section className="page-hero-shell overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,174,98,0.08),transparent_24%),radial-gradient(circle_at_left_center,rgba(56,189,248,0.08),transparent_24%)]" />
          <div className="relative">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Inbox</p>
                <h2 className="mt-4 font-display text-4xl text-white">Your recent correspondence</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  Incoming notes and sent messages stay together so it is easy to see who reached out, who replied, and which conversations still need attention.
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
                <p className="text-2xl font-semibold text-white">{messages.length}</p>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Messages loaded</p>
              </div>
            </div>
            {loading ? (
              <SkeletonList count={3} />
            ) : error ? (
              <EmptyState title="Inbox unavailable" copy={error} />
            ) : (
              <MessageList messages={messages} highlightedMessageId={Number(searchParams.get('messageId')) || null} currentUser={user} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
