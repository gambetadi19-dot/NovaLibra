import { BookCopy, Gem, LayoutTemplate } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  isFeatured: false,
  shortDescription: '',
  fullDescription: '',
  coverImage: '',
  amazonUrl: ''
};

export default function AdminBooks() {
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
      const { data } = await api.get('/books');
      setBooks(data.books);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to load books.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingId) {
        await api.patch(`/books/${editingId}`, form);
        toast.success('Book updated.', 'The catalog now reflects your latest edits.');
      } else {
        await api.post('/books', form);
        toast.success('Book created.', 'The new title is now part of the catalog.');
      }

      setForm(initialForm);
      setEditingId(null);
      await fetchBooks();
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to save this book.';
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
      isFeatured: Boolean(book.isFeatured),
      shortDescription: book.shortDescription,
      fullDescription: book.fullDescription,
      coverImage: book.coverImage || '',
      amazonUrl: book.amazonUrl || ''
    });
  }

  async function handleDelete(bookId) {
    try {
      await api.delete(`/books/${bookId}`);
      await fetchBooks();
      toast.success('Book deleted.', 'The title has been removed from the catalog.');
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to delete this book.';
      setError(message);
      toast.error('Delete failed.', message);
    }
  }

  return (
    <div className="page-shell space-y-8">
      <section className="page-hero-shell overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
        <div className="absolute inset-0 hero-ambient opacity-75" />
        <div className="absolute inset-y-0 right-0 w-[42%] bg-[radial-gradient(circle_at_top_right,rgba(214,174,98,0.18),transparent_28%),radial-gradient(circle_at_75%_65%,rgba(56,189,248,0.1),transparent_24%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="max-w-3xl">
            <p className="eyebrow">Catalog editor</p>
            <h1 className="mt-4 font-display text-5xl text-white sm:text-6xl">{editingId ? 'Refine a published title with more control.' : 'Shape the storefront with a premium editorial workflow.'}</h1>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Maintain metadata, cover presentation, and discovery positioning from a workspace that feels as intentional as the reader-facing catalog.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,26,0.9),rgba(9,13,26,0.58))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
            <div className="space-y-4">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <BookCopy className="h-5 w-5 text-brand-gold" />
                  <div>
                    <p className="text-2xl font-semibold text-white">{books.length}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Titles in catalog</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <Gem className="h-5 w-5 text-fuchsia-300" />
                  <p className="text-sm leading-7 text-slate-300">Feature standout books to lift discovery moments across the platform.</p>
                </div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <LayoutTemplate className="h-5 w-5 text-cyan-300" />
                  <p className="text-sm leading-7 text-slate-300">Keep descriptions, genre tags, and purchase links aligned with the luxury front-end treatment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="admin-grid">
        <section className="page-hero-shell overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,174,98,0.1),transparent_24%)]" />
          <div className="relative">
            <p className="eyebrow">Book editor</p>
            <h2 className="mt-4 font-display text-4xl text-white">{editingId ? 'Update catalog details' : 'Add a new book to the catalog'}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">Use this workspace to maintain the storefront, metadata, and reading presentation for every title.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.28em] text-brand-sand/90">Genre</span>
                <select value={form.genre} onChange={(event) => setForm((current) => ({ ...current, genre: event.target.value }))} className="luxury-select">
                  {genreOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.28em] text-brand-sand/90">Category</span>
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="luxury-select">
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="Short description"
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
              <Input label="Cover image URL" value={form.coverImage} onChange={(event) => setForm((current) => ({ ...current, coverImage: event.target.value }))} />
              <Input label="Amazon URL" value={form.amazonUrl} onChange={(event) => setForm((current) => ({ ...current, amazonUrl: event.target.value }))} />
              <label className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))}
                  className="h-4 w-4 rounded border-white/20 bg-brand-900"
                />
                Feature this book in discovery sections
              </label>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update book' : 'Create book'}</Button>
                {editingId ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingId(null);
                      setForm(initialForm);
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
              {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            </form>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Catalog</p>
              <h2 className="mt-3 font-display text-3xl text-white">Published titles</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
              {books.length} total
            </span>
          </div>
          {loading ? (
            <SkeletonList count={3} />
          ) : books.length ? (
            books.map((book) => (
              <article key={book.id} className="page-hero-shell overflow-hidden p-6 transition duration-300 hover:-translate-y-0.5 hover:border-white/15">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,174,98,0.08),transparent_20%)]" />
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Published title</p>
                    <p className="mt-2 font-display text-3xl text-white">{book.title}</p>
                    {book.author?.name ? <p className="mt-2 text-sm text-slate-500">Owned by {book.author.name}</p> : null}
                    <p className="mt-3 text-sm leading-7 text-slate-400">{book.shortDescription}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{book.genre || 'General'}</span>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{book.category || 'General'}</span>
                      {book.isFeatured ? <span className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-3 py-1.5 text-brand-sand">Featured</span> : null}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => startEdit(book)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(book.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <EmptyState title="No books yet" copy="Create the first book from the editor panel." icon={<BookCopy className="h-5 w-5" />} />
          )}
        </section>
      </div>
    </div>
  );
}
