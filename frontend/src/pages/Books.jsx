import { useEffect, useMemo, useState } from 'react';
import { LibraryBig, Search, Sparkles } from 'lucide-react';
import api from '../api/axios';
import BookCard from '../components/books/BookCard';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import SectionHeading from '../components/ui/SectionHeading';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useAuth } from '../hooks/useAuth';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [discovery, setDiscovery] = useState({ genres: [], categories: [] });
  const [filters, setFilters] = useState({
    q: '',
    genre: '',
    category: '',
    featured: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setError('');
    setLoading(true);

    const params = new URLSearchParams();
    if (filters.q.trim()) {
      params.set('q', filters.q.trim());
    }
    if (filters.genre) {
      params.set('genre', filters.genre);
    }
    if (filters.category) {
      params.set('category', filters.category);
    }
    if (filters.featured) {
      params.set('featured', 'true');
    }

    api
      .get(`/books${params.toString() ? `?${params.toString()}` : ''}`)
      .then(({ data }) => {
        setBooks(data.books);
        setDiscovery(data.discovery || { genres: [], categories: [] });
      })
      .catch((apiError) => {
        setError(apiError.response?.data?.message || 'Unable to load books.');
      })
      .finally(() => setLoading(false));
  }, [filters]);

  async function handleFavorite(bookId) {
    if (!isAuthenticated) {
      return;
    }

    const { data } = await api.post(`/favorites/${bookId}/toggle`);
    setBooks((current) =>
      current.map((book) =>
        book.id === bookId
          ? {
              ...book,
              isFavorited: data.favorited,
              _count: {
                ...book._count,
                favorites: (book._count?.favorites || 0) + (data.favorited ? 1 : -1)
              }
            }
          : book
      )
    );
  }

  const featuredBooks = useMemo(() => books.filter((book) => book.isFeatured), [books]);

  return (
    <div className="page-shell">
      <SectionHeading
        eyebrow="Library"
        title="Browse a catalog designed to feel guided, not crowded."
        copy="Search by title or author, move through genres and categories, and surface the books the platform is deliberately placing in front of readers."
      />
      <section className="mt-10 grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="section-card relative overflow-hidden space-y-5">
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_70%)]" />
          <div>
            <p className="eyebrow">Discovery filters</p>
            <h2 className="mt-3 font-display text-3xl text-white">Find the right shelf quickly</h2>
          </div>
          <Input
            label="Search"
            placeholder="Search titles, authors, genres, or themes..."
            value={filters.q}
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
          />
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.28em] text-brand-sand/90">Genre</span>
            <select
              value={filters.genre}
              onChange={(event) => setFilters((current) => ({ ...current, genre: event.target.value }))}
              className="luxury-select"
            >
              <option value="">All genres</option>
              {discovery.genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.28em] text-brand-sand/90">Category</span>
            <select
              value={filters.category}
              onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
              className="luxury-select"
            >
              <option value="">All categories</option>
              {discovery.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 shadow-[0_16px_32px_rgba(0,0,0,0.14)]">
            <input
              type="checkbox"
              checked={filters.featured}
              onChange={(event) => setFilters((current) => ({ ...current, featured: event.target.checked }))}
              className="h-4 w-4 rounded border-white/20 bg-brand-900"
            />
            Show only featured placements
          </label>
          <Button
            variant="secondary"
            onClick={() =>
              setFilters({
                q: '',
                genre: '',
                category: '',
                featured: false
              })
            }
          >
            Reset filters
          </Button>
        </div>
        <div className="page-hero-shell p-8">
          <div className="absolute inset-0 bg-hero-radial opacity-50" />
          <div className="relative">
            <div className="flex items-center gap-3 text-brand-gold">
              <Sparkles className="h-5 w-5" />
              <p className="eyebrow">Curated path</p>
            </div>
            <h2 className="mt-4 font-display text-4xl text-white">Discovery should move from intrigue to confidence.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Search narrows the field, genres and categories give structure, and featured placements surface the books NovaLibra most wants readers to encounter first.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">{books.length} matching books</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">{featuredBooks.length} featured in current view</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">{discovery.genres.length} genres available</span>
            </div>
          </div>
        </div>
      </section>
      {featuredBooks.length ? (
        <section className="mt-12">
          <div className="mb-6 flex items-center gap-3">
            <Search className="h-4 w-4 text-brand-gold" />
            <p className="eyebrow">Featured now</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {featuredBooks.slice(0, 2).map((book) => (
              <BookCard key={`featured-${book.id}`} book={book} onFavorite={handleFavorite} />
            ))}
          </div>
        </section>
      ) : null}
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)
        ) : error ? (
          <EmptyState title="Books unavailable" copy={error} />
        ) : books.length ? (
          books.map((book) => <BookCard key={book.id} book={book} onFavorite={handleFavorite} />)
        ) : (
          <EmptyState
            title="No books in the catalog"
            copy="Use the admin dashboard to add the first published title and start building the platform library."
            icon={<LibraryBig className="h-5 w-5" />}
          />
        )}
      </div>
    </div>
  );
}
