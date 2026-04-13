import { BookPlus, PenSquare, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import { categoryOptions, genreOptions } from '../constants/discoveryOptions';
import { SkeletonList } from '../components/ui/Skeleton';
import { useToast } from '../hooks/useToast';

const initialForm = {
  title: '',
  genre: genreOptions[0],
  category: categoryOptions[0],
  shortDescription: '',
  fullDescription: '',
  coverImage: '',
  amazonUrl: ''
};

export default function MyBooks() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  async function fetchBooks() {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/users/me/books');
      setBooks(data.books);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to load your books.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingId) {
        await api.patch(`/books/${editingId}`, form);
        toast.success('Book updated.', 'Your published title now reflects the latest version.');
      } else {
        await api.post('/books', form);
        toast.success('Book published.', 'Your title is now live in the NovaLibra catalog.');
      }

      setEditingId(null);
      setForm(initialForm);
      await fetchBooks();
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to save this book right now.';
      setError(message);
      toast.error('Book save failed.', message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(book) {
    setEditingId(book.id);
    setForm({
      title: book.title,
      genre: book.genre || genreOptions[0],
      category: book.category || categoryOptions[0],
      shortDescription: book.shortDescription,
      fullDescription: book.fullDescription,
      coverImage: book.coverImage || '',
      amazonUrl: book.amazonUrl || ''
    });
  }

  async function handleDelete(bookId) {
    try {
      await api.delete(`/books/${bookId}`);
      if (editingId === bookId) {
        setEditingId(null);
        setForm(initialForm);
      }
      await fetchBooks();
      toast.success('Book deleted.', 'The title has been removed from your author catalog.');
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to delete this book.';
      setError(message);
      toast.error('Delete failed.', message);
    }
  }

  return (
    <div className="page-shell">
      <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="section-card">
          <p className="eyebrow">Author workspace</p>
          <h1 className="mt-4 font-display text-4xl text-white">{editingId ? 'Refine your published book' : 'Publish a new title'}</h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            Shape how readers discover your work with polished metadata, thoughtful descriptions, and a presentation that feels worthy of the book.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.28em] text-brand-sand/90">Genre</span>
              <select
                value={form.genre}
                onChange={(event) => setForm((current) => ({ ...current, genre: event.target.value }))}
                className="w-full rounded-[22px] border border-white/10 bg-brand-900/80 px-4 py-3.5 text-sm text-white shadow-inner shadow-black/20 transition focus:border-brand-gold focus:bg-brand-900"
              >
                {genreOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.28em] text-brand-sand/90">Category</span>
              <select
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                className="w-full rounded-[22px] border border-white/10 bg-brand-900/80 px-4 py-3.5 text-sm text-white shadow-inner shadow-black/20 transition focus:border-brand-gold focus:bg-brand-900"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Short description"
              hint="A concise invitation that helps readers decide to open the full page."
              value={form.shortDescription}
              onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))}
            />
            <Input
              label="Full description"
              textarea
              rows={6}
              value={form.fullDescription}
              onChange={(event) => setForm((current) => ({ ...current, fullDescription: event.target.value }))}
            />
            <Input
              label="Cover image URL"
              value={form.coverImage}
              onChange={(event) => setForm((current) => ({ ...current, coverImage: event.target.value }))}
            />
            <Input
              label="Purchase URL"
              value={form.amazonUrl}
              onChange={(event) => setForm((current) => ({ ...current, amazonUrl: event.target.value }))}
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update book' : 'Publish book'}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingId(null);
                    setForm(initialForm);
                  }}
                >
                  Cancel edit
                </Button>
              ) : null}
            </div>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">My Books</p>
              <h2 className="mt-3 font-display text-3xl text-white">Your published catalog</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
              {books.length} total
            </span>
          </div>
          {loading ? (
            <SkeletonList count={3} />
          ) : books.length ? (
            books.map((book) => (
              <article key={book.id} className="section-card transition hover:-translate-y-0.5 hover:border-white/15">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Published title</p>
                    <p className="mt-2 font-display text-3xl text-white">{book.title}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{book.shortDescription}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{book.genre || 'General'}</span>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{book.category || 'General'}</span>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{book._count?.favorites || 0} saves</span>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{book._count?.comments || 0} comments</span>
                      {book.isFeatured ? <span className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-3 py-1.5 text-brand-sand">Featured</span> : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button as={Link} to={`/books/${book.slug}`} variant="secondary">
                      View page
                    </Button>
                    <Button variant="secondary" onClick={() => startEdit(book)}>
                      <PenSquare className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(book.id)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <EmptyState
              title="No books published yet"
              copy="Publish your first title here to begin building your author presence on NovaLibra."
              icon={<BookPlus className="h-5 w-5" />}
            />
          )}
        </section>
      </div>
    </div>
  );
}
