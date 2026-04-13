import { MessageCircleReply, Pencil, Trash2 } from 'lucide-react';
import { formatDate, initials } from '../../utils/format';
import Button from '../ui/Button';

function Avatar({ name }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-gold/20 bg-brand-gold/10 text-sm font-bold text-brand-gold">
      {initials(name)}
    </div>
  );
}

export default function CommentThread({ comments, user, onReply, onDelete, onEdit, highlightedCommentId = null }) {
  if (!comments.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/15 px-6 py-10 text-center text-slate-400">
        No comments yet. Start the conversation.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {comments.map((comment) => (
        <div
          key={comment.id}
          id={`comment-${comment.id}`}
          className={`scroll-mt-28 rounded-[28px] border p-5 transition ${
            highlightedCommentId === comment.id
              ? 'border-brand-gold/40 bg-brand-gold/10 shadow-[0_18px_48px_rgba(214,174,98,0.14)]'
              : 'border-white/10 bg-white/[0.03]'
          }`}
        >
          <div className="flex items-start gap-4">
            <Avatar name={comment.user.name} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-semibold text-white">{comment.user.name}</p>
                <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-slate-400">
                  {comment.user.role}
                </span>
                <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
              </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{comment.content}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  {comment.replies?.length || 0} replies
                </span>
                {user ? (
                  <Button variant="ghost" className="px-0 py-0 text-sm" onClick={() => onReply(comment.id)}>
                    <span className="inline-flex items-center gap-2">
                      <MessageCircleReply className="h-4 w-4" />
                      Reply
                    </span>
                  </Button>
                ) : null}
                {user && (user.id === comment.user.id || user.role === 'ADMIN') ? (
                  <>
                    {user.id === comment.user.id ? (
                      <Button variant="ghost" className="px-0 py-0 text-sm" onClick={() => onEdit(comment)}>
                        <span className="inline-flex items-center gap-2">
                          <Pencil className="h-4 w-4" />
                          Edit
                        </span>
                      </Button>
                    ) : null}
                    <Button variant="ghost" className="px-0 py-0 text-sm text-rose-300" onClick={() => onDelete(comment.id)}>
                      <span className="inline-flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </span>
                    </Button>
                  </>
                ) : null}
              </div>

              {comment.replies?.length ? (
                <div className="mt-5 space-y-3 border-l border-white/10 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="rounded-2xl bg-brand-900/60 p-4">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-white">{reply.user.name}</p>
                        <span className={`text-xs uppercase tracking-[0.25em] ${reply.user.role === 'AUTHOR' ? 'text-brand-gold' : 'text-slate-400'}`}>
                          {reply.user.role === 'AUTHOR' ? 'AUTHOR RESPONSE' : reply.user.role}
                        </span>
                        <span className="text-xs text-slate-500">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{reply.content}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
