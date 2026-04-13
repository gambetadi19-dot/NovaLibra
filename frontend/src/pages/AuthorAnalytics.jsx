import { useEffect, useState } from 'react';
import { BarChart3, Users, MessageSquareText, Star } from 'lucide-react';
import api from '../api/axios';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import StatCard from '../components/ui/StatCard';

export default function AuthorAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/users/me/analytics')
      .then(({ data }) => setAnalytics(data.analytics))
      .catch((apiError) => {
        setError(apiError.response?.data?.message || 'Unable to load analytics.');
      });
  }, []);

  if (!analytics && !error) {
    return (
      <div className="page-shell">
        <Loader label="Loading author analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <EmptyState title="Analytics unavailable" copy={error} />
      </div>
    );
  }

  return (
    <div className="page-shell space-y-10">
      <section>
        <p className="eyebrow">Author analytics</p>
        <h1 className="mt-4 font-display text-5xl text-white">See whether your presence is turning into momentum.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
          Followers, reviews, comments, and saves make your growth visible so you can tell which books are carrying attention and where reader energy is building.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Followers" value={analytics.followerCount} hint="Readers following your profile" />
        <StatCard label="Books" value={analytics.totalBooks} hint="Published titles" />
        <StatCard label="Saves" value={analytics.totalFavorites} hint="Readers saving your books" />
        <StatCard label="Comments" value={analytics.totalComments} hint="Conversation across titles" />
        <StatCard label="Reviews" value={analytics.totalReviews} hint="Reader review volume" />
        <StatCard label="Avg rating" value={analytics.averageRating ?? '-'} hint="Across reviewed books" />
      </section>

      <section className="section-card">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-brand-gold" />
          <div>
            <p className="eyebrow">Top performing books</p>
            <h2 className="mt-2 font-display text-4xl text-white">Where readers are leaning in.</h2>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {analytics.topBooks.length ? (
            analytics.topBooks.map((book) => (
              <article key={book.id} className="rounded-[24px] border border-white/10 bg-black/10 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-3xl text-white">{book.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                      <span>{book.genre}</span>
                      <span>{book.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                      <Users className="h-4 w-4" />
                      {book.favorites} saves
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                      <MessageSquareText className="h-4 w-4" />
                      {book.comments} comments
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                      <Star className="h-4 w-4" />
                      {book.averageRating ?? '-'} avg
                    </span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <EmptyState title="No book signals yet" copy="Reviews, saves, and comments will begin shaping this view as readers engage." />
          )}
        </div>
      </section>
    </div>
  );
}
