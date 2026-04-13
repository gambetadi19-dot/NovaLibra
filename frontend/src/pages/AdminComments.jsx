import { MessageSquareDashed, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import CommentComposer from '../components/comments/CommentComposer';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/Skeleton';
import { useToast } from '../hooks/useToast';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  async function fetchComments() {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/comments');
      setComments(data.comments);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to load comments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
  }, []);

  async function handleDelete(commentId) {
    try {
      await api.delete(`/comments/${commentId}`);
      await fetchComments();
      toast.success('Comment deleted.', 'The moderation queue has been updated.');
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to delete this comment.';
      setError(message);
      toast.error('Delete failed.', message);
    }
  }

  async function handleReply(content) {
    try {
      await api.post(`/comments/${replyTo}/replies`, { content });
      setReplyTo(null);
      await fetchComments();
      toast.success('Reply posted.', 'The response is now visible to members.');
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to post this reply.';
      setError(message);
      toast.error('Reply failed.', message);
    }
  }

  return (
    <div className="page-shell space-y-8">
      <section className="page-hero-shell overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
        <div className="absolute inset-0 hero-ambient opacity-75" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="max-w-3xl">
            <p className="eyebrow">Moderation</p>
            <h1 className="mt-4 font-display text-5xl text-white sm:text-6xl">Guide community conversation without losing the premium feel.</h1>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Stay close to reader discussion, protect tone and quality, and respond from a moderation view that feels elevated instead of utilitarian.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,26,0.9),rgba(9,13,26,0.58))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
            <div className="space-y-3">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-gold" />
                  <div>
                    <p className="text-2xl font-semibold text-white">{comments.length}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Comments in queue</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-300">
                Reply when context matters. Remove when quality, safety, or tone requires a stronger line.
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-300">
                Visible moderation can still feel elegant when the tooling is clear and paced.
              </div>
            </div>
          </div>
        </div>
      </section>

      {replyTo ? (
        <div className="page-hero-shell overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.08),transparent_24%)]" />
          <div className="relative">
            <div className="mb-5 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-fuchsia-300" />
              <div>
                <p className="eyebrow">Author reply</p>
                <h2 className="mt-2 font-display text-3xl text-white">Respond with care and clarity</h2>
              </div>
            </div>
            <CommentComposer label="Author reply" submitLabel="Post reply" onSubmit={handleReply} onCancel={() => setReplyTo(null)} />
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <div className="space-y-4">
        {loading ? (
          <SkeletonList count={3} />
        ) : comments.length ? (
          comments.map((comment) => (
            <article key={comment.id} className="page-hero-shell overflow-hidden p-6 transition duration-300 hover:-translate-y-0.5 hover:border-white/15">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,174,98,0.08),transparent_20%)]" />
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                      {comment.user.name} on {comment.book.title}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{comment.content}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setReplyTo(comment.id)}>
                      Reply
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(comment.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                {comment.replies?.length ? (
                  <div className="mt-5 border-l border-white/10 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="mb-3 rounded-[22px] border border-white/10 bg-black/10 p-4">
                        <p className="font-semibold text-white">{reply.user.name}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No comments to moderate" copy="Community comments will appear here as activity grows." icon={<MessageSquareDashed className="h-5 w-5" />} />
        )}
      </div>
    </div>
  );
}
