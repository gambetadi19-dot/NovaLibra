import EmptyState from '../ui/EmptyState';
import { formatDate } from '../../utils/format';

export default function MessageList({ messages, highlightedMessageId = null, currentUser = null }) {
  if (!messages.length) {
    return <EmptyState title="No messages yet" copy="New conversations will appear here once a message is sent or received." />;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isIncoming = currentUser ? message.receiverId === currentUser.id : false;
        const counterpart = currentUser ? (isIncoming ? message.sender : message.receiver) : null;
        const counterpartRole =
          counterpart?.role === 'AUTHOR' ? 'Author' : counterpart?.role === 'ADMIN' ? 'Platform team' : counterpart?.role;
        const directionLabel = currentUser ? (isIncoming ? 'Received' : 'Sent') : 'Conversation';

        return (
          <article
            key={message.id}
            id={`message-${message.id}`}
            className={`panel scroll-mt-28 p-6 transition ${
              highlightedMessageId === message.id ? 'border-brand-gold/40 shadow-[0_18px_48px_rgba(214,174,98,0.14)]' : ''
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-slate-500">
                  <span>{directionLabel}</span>
                  {counterpart?.name ? <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">{counterpart.name}</span> : null}
                  {counterpartRole ? <span>{counterpartRole}</span> : null}
                </div>
                <h3 className="mt-3 break-words font-display text-2xl text-white sm:text-3xl">{message.subject || 'Direct message'}</h3>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${message.status === 'UNREAD' ? 'border-brand-gold/25 bg-brand-gold/15 text-brand-gold' : 'border-white/10 bg-white/5 text-slate-400'}`}>
                {message.status}
              </span>
            </div>
            <div className="mt-5 rounded-[22px] border border-white/10 bg-black/10 p-4">
              <p className="text-sm leading-7 text-slate-300">{message.content}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-slate-500">
              <span>
                {message.sender.name} to {message.receiver.name}
              </span>
              <span>{formatDate(message.createdAt)}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
