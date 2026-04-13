import { MailCheck, MessageSquareText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import MessageList from '../components/messages/MessageList';
import MessageComposer from '../components/messages/MessageComposer';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function AdminMessages() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const toast = useToast();

  async function loadMessages() {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/messages');
      setMessages(data.messages);
    } catch (apiError) {
      setMessages([]);
      setError(apiError.response?.data?.message || 'Unable to load inbox.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function handleReply(messageInput) {
    try {
      await api.post('/messages', messageInput);
      setReplyTarget(null);
      await loadMessages();
      toast.success('Reply sent.', 'The member will see your response in their inbox.');
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to send your reply.';
      toast.error('Reply failed.', message);
      throw apiError;
    }
  }

  useEffect(() => {
    if (!messages?.length) {
      return;
    }

    const unreadMessageIds = messages.filter((message) => message.status === 'UNREAD').map((message) => message.id);

    if (!unreadMessageIds.length) {
      return;
    }

    let active = true;

    Promise.allSettled(unreadMessageIds.map((messageId) => api.patch(`/messages/${messageId}/read`))).then(() => {
      if (!active) {
        return;
      }

      setMessages((current) =>
        current.map((message) =>
          unreadMessageIds.includes(message.id)
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
  }, [messages]);

  useEffect(() => {
    const messageId = searchParams.get('messageId');
    if (!messageId || !messages?.length) {
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

  return (
    <div className="page-shell space-y-8">
      <section className="page-hero-shell overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
        <div className="absolute inset-0 hero-ambient opacity-75" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="max-w-3xl">
            <p className="eyebrow">Inbox management</p>
            <h1 className="mt-4 font-display text-5xl text-white sm:text-6xl">Review platform messages from a more composed support desk.</h1>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Reply quickly, keep context visible, and maintain a polished communication experience for members without the admin inbox feeling flat.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,26,0.9),rgba(9,13,26,0.58))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
            <div className="space-y-4">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <MailCheck className="h-5 w-5 text-brand-gold" />
                  <div>
                    <p className="text-2xl font-semibold text-white">{messages?.length || 0}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Messages loaded</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-300">
                Reply directly from each thread while keeping sender context visible beside the conversation.
              </div>
            </div>
          </div>
        </div>
      </section>

      {replyTarget ? (
        <div className="page-hero-shell overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.08),transparent_24%)]" />
          <div className="relative">
            <div className="mb-5 flex items-center gap-3">
              <MessageSquareText className="h-5 w-5 text-fuchsia-300" />
              <div>
                <p className="eyebrow">Reply composer</p>
                <h2 className="mt-2 font-display text-3xl text-white">Respond to {replyTarget.receiverName}</h2>
              </div>
            </div>
            <MessageComposer onSubmit={handleReply} receiverId={replyTarget.receiverId} recipientLabel={replyTarget.receiverName} />
          </div>
        </div>
      ) : null}

      <div>
        {loading ? (
          <SkeletonList count={3} />
        ) : error ? (
          <EmptyState title="Inbox unavailable" copy={error} />
        ) : messages.length ? (
          <div className="space-y-4">
            {messages.map((message) => {
              const otherParty =
                message.senderId === user.id
                  ? { receiverId: message.receiverId, receiverName: message.receiver.name }
                  : { receiverId: message.senderId, receiverName: message.sender.name };

              return (
                <div key={message.id} className="page-hero-shell overflow-hidden p-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,174,98,0.08),transparent_20%)]" />
                  <div className="relative space-y-3">
                    <MessageList messages={[message]} highlightedMessageId={Number(searchParams.get('messageId')) || null} currentUser={user} />
                    <button
                      type="button"
                      onClick={() => setReplyTarget(otherParty)}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-brand-sand transition hover:bg-white/[0.06]"
                    >
                      Reply to {otherParty.receiverName}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Inbox is clear" copy="New member messages will appear here as soon as they arrive." />
        )}
      </div>
    </div>
  );
}
