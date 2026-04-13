import { useEffect, useMemo, useState } from 'react';
import { Heart, Star, Trash2 } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import CommentComposer from '../components/comments/CommentComposer';
import CommentThread from '../components/comments/CommentThread';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import { SkeletonBlock } from '../components/ui/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/format';

export default function BookDetails() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyTarget, setReplyTarget] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setBook(null);
    setReplyTarget(null);
    setEditingComment(null);
    setReviewForm({ rating: 5, content: '' });

    api
      .get(`/books/${slug}`)
      .then(({ data }) => {
        if (active) {
          setBook(data.book);
          if (data.book.currentUserReview) {
            setReviewForm({
              rating: data.book.currentUserReview.rating,
              content: data.book.currentUserReview.content
            });
          }
        }
      })
      .catch((apiError) => {
        if (active) {
          setError(apiError.response?.data?.message || 'Unable to load this book.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  async function refreshBook() {
    const { data } = await api.get(`/books/${slug}`);
    setBook(data.book);
    if (data.book.currentUserReview) {
      setReviewForm({
        rating: data.book.currentUserReview.rating,
        content: data.book.currentUserReview.content
      });
    } else {
      setReviewForm({ rating: 5, content: '' });
    }
    if (replyTarget && !data.book.comments.some((comment) => comment.id === replyTarget)) {
      setReplyTarget(null);
    }
    if (editingComment && !data.book.comments.some((comment) => comment.id === editingComment.id)) {
      setEditingComment(null);
    }
  }

  async function handleComment(content) {
    await api.post('/comments', { bookId: book.id, content });
    await refreshBook();
  }

  async function handleReply(content) {
    await api.post(`/comments/${replyTarget}/replies`, { content });
    setReplyTarget(null);
    await refreshBook();
  }

  async function handleEdit(content) {
    await api.patch(`/comments/${editingComment.id}`, { content });
    setEditingComment(null);
    await refreshBook();
  }

  async function handleDelete(commentId) {
    await api.delete(`/comments/${commentId}`);
    await refreshBook();
  }

  async function handleFavorite() {
    const { data } = await api.post(`/favorites/${book.id}/toggle`);
    setBook((current) => ({
      ...current,
      isFavorited: data.favorited,
      _count: {
        ...current._count,
        favorites: (current._count?.favorites || 0) + (data.favorited ? 1 : -1)
      }
    }));
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();

    try {
      await api.post('/reviews', {
        bookId: book.id,
        rating: reviewForm.rating,
        content: reviewForm.content.trim()
      });
      toast.success('Review saved.', 'Your review is now live on this book page.');
      await refreshBook();
    } catch (apiError) {
      toast.error('Review failed.', apiError.response?.data?.message || 'Unable to save your review.');
    }
  }

  async function handleDeleteReview(reviewId) {
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review removed.', 'Your review has been deleted.');
      await refreshBook();
    } catch (apiError) {
      toast.error('Delete failed.', apiError.response?.data?.message || 'Unable to delete your review.');
    }
  }

  const highlightedCommentId = useMemo(() => {
    if (!book) {
      return null;
    }

    const commentId = Number(searchParams.get('commentId'));
    if (commentId && book.comments?.some((comment) => comment.id === commentId)) {
      return commentId;
    }

    const commentAuthor = Number(searchParams.get('commentAuthor'));
    if (commentAuthor) {
      return book.comments?.find((comment) => comment.user.id === commentAuthor)?.id || null;
    }

    return null;
  }, [book, searchParams]);

  const discussionStats = useMemo(() => {
    if (!book) {
      return { participantCount: 0, replyCount: 0 };
    }

    const participantIds = new Set();
    let replyCount = 0;

    for (const comment of book.comments || []) {
      participantIds.add(comment.user.id);
      for (const reply of comment.replies || []) {
        participantIds.add(reply.user.id);
        replyCount += 1;
      }
    }

    return {
      participantCount: participantIds.size,
      replyCount
    };
  }, [book]);

  useEffect(() => {
    if (!highlightedCommentId) {
      return;
    }

    const timer = window.setTimeout(() => {
      document.getElementById(`comment-${highlightedCommentId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [highlightedCommentId]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <SkeletonBlock className="min-h-[24rem] w-full rounded-[30px]" />
          <div className="space-y-5">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-14 w-3/4" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-11/12" />
            <SkeletonBlock className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container-shell py-20">
        <EmptyState title="Book not found" copy={error || 'This title could not be loaded.'} />
        <div className="mt-6">
          <Button as={Link} to="/books">
            Back to books
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="page-hero-shell overflow-hidden">
          <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
        </div>

        <div className="page-hero-shell p-8">
          <p className="eyebrow">Book detail</p>
          <h1 className="mt-4 font-display text-4xl text-white sm:text-5xl lg:text-6xl">{book.title}</h1>
          {book.author?.name ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              {book.author.role === 'AUTHOR' ? (
                <Link to={`/authors/${book.author.id}`} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 hover:text-white">
                  By {book.author.name}
                </Link>
              ) : (
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">By {book.author.name}</span>
              )}
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">{book.author.role}</span>
            </div>
          ) : null}
          <p className="mt-6 text-lg leading-8 text-slate-300">{book.fullDescription}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button as="a" href={book.amazonUrl} target="_blank" rel="noreferrer" size="lg">
              Buy on Amazon
            </Button>
            {isAuthenticated && book.author?.id !== user?.id && book.author?.role === 'AUTHOR' ? (
              <Button as={Link} to={`/messages?recipientId=${book.author.id}`} variant="secondary" size="lg">
                Message the author
              </Button>
            ) : null}
            {isAuthenticated ? (
              <Button variant="secondary" onClick={handleFavorite} size="lg">
                <Heart className="mr-2 h-4 w-4" fill={book.isFavorited ? 'currentColor' : 'none'} />
                {book.isFavorited ? 'Saved' : 'Save book'}
              </Button>
            ) : null}
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">{book._count?.favorites || 0} saves</span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">{book._count?.comments || 0} comments</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
              <Star className="h-4 w-4" />
              {book.averageRating ?? '-'} average rating
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">{book.reviewCount || 0} reviews</span>
          </div>
          {book.author?.bio ? <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400">{book.author.bio}</p> : null}
        </div>
      </div>

      <section className="mt-16 space-y-6">
        <div>
          <p className="eyebrow">Reviews and ratings</p>
          <h2 className="mt-3 font-display text-4xl text-white">Readers can leave richer appreciation now.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Reviews help books build social proof, help authors see momentum, and make discovery feel earned instead of random.
          </p>
        </div>

        {isAuthenticated ? (
          <form onSubmit={handleReviewSubmit} className="section-card space-y-4">
            <div className="grid gap-4 md:grid-cols-[0.28fr_1fr]">
              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.28em] text-brand-sand/90">Rating</span>
                <select
                  value={reviewForm.rating}
                  onChange={(event) => setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))}
                  className="w-full rounded-[22px] border border-white/10 bg-brand-900/80 px-4 py-3.5 text-sm text-white shadow-inner shadow-black/20 transition focus:border-brand-gold focus:bg-brand-900"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} stars
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="Review"
                textarea
                rows={5}
                required
                hint={`${reviewForm.content.trim().length}/1500 characters`}
                maxLength={1500}
                placeholder="What did this book do especially well for you as a reader?"
                value={reviewForm.content}
                onChange={(event) => setReviewForm((current) => ({ ...current, content: event.target.value }))}
              />
            </div>
            <Button type="submit">{book.currentUserReview ? 'Update review' : 'Publish review'}</Button>
          </form>
        ) : (
          <EmptyState
            title="Sign in to review"
            copy="Ratings and reviews help books and authors build momentum over time."
            action={
              <Button as={Link} to="/login">
                Sign in
              </Button>
            }
            className="px-4 py-8"
          />
        )}

        <div className="space-y-4">
          {book.reviews?.length ? (
            book.reviews.map((review) => (
              <article key={review.id} className="section-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{review.user.name}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                      <span>{review.rating} stars</span>
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                  {user?.id === review.userId ? (
                    <Button variant="danger" size="sm" onClick={() => handleDeleteReview(review.id)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{review.content}</p>
              </article>
            ))
          ) : (
            <EmptyState title="No reviews yet" copy="The first thoughtful review will help set the tone for this book's reputation." />
          )}
        </div>
      </section>

      <section id="discussion" className="mt-16 space-y-6 scroll-mt-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Discussion</p>
            <h2 className="mt-3 font-display text-4xl text-white">Threaded community conversation</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              {discussionStats.participantCount} participants, {book._count?.comments || 0} top-level comments, and {discussionStats.replyCount} replies keep this book page active.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-slate-500">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">Readers return through replies</span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">Authors stay visible in-thread</span>
            </div>
          </div>
        </div>
        {isAuthenticated ? (
          <CommentComposer onSubmit={handleComment} placeholder="What stayed with you after reading about this book?" />
        ) : (
          <EmptyState
            title="Join the discussion"
            copy="Sign in to save this book, reply to other readers, and keep your place in the conversation."
            action={
              <Button as={Link} to="/login">
                Sign in to comment
              </Button>
            }
            className="px-4 py-8"
          />
        )}
        {replyTarget ? (
          <CommentComposer
            label="Write a reply"
            placeholder="Respond to this community member..."
            submitLabel="Reply"
            onSubmit={handleReply}
            onCancel={() => setReplyTarget(null)}
          />
        ) : null}
        {editingComment ? (
          <CommentComposer
            label="Edit your comment"
            placeholder="Update your comment..."
            initialValue={editingComment.content}
            submitLabel="Save changes"
            onSubmit={handleEdit}
            onCancel={() => setEditingComment(null)}
          />
        ) : null}
        <CommentThread
          comments={book.comments || []}
          user={user}
          onReply={setReplyTarget}
          onDelete={handleDelete}
          onEdit={setEditingComment}
          highlightedCommentId={highlightedCommentId}
        />
      </section>
    </div>
  );
}
