import { MegaphoneOff, RadioTower, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import { SkeletonList } from '../components/ui/Skeleton';
import { useToast } from '../hooks/useToast';

const initialForm = {
  title: '',
  content: ''
};

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      const { data } = await api.get('/announcements');
      setAnnouncements(data.announcements);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to load announcements.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingId) {
        await api.patch(`/announcements/${editingId}`, form);
        toast.success('Announcement updated.', 'Members will see the refreshed update.');
      } else {
        await api.post('/announcements', form);
        toast.success('Announcement published.', 'The update is now live for members.');
      }

      setEditingId(null);
      setForm(initialForm);
      await fetchAnnouncements();
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to save announcement.';
      setError(message);
      toast.error('Announcement save failed.', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/announcements/${id}`);
      await fetchAnnouncements();
      toast.success('Announcement deleted.', 'The update has been removed.');
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to delete announcement.';
      setError(message);
      toast.error('Delete failed.', message);
    }
  }

  return (
    <div className="page-shell space-y-8">
      <section className="page-hero-shell overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
        <div className="absolute inset-0 hero-ambient opacity-75" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="max-w-3xl">
            <p className="eyebrow">Announcements</p>
            <h1 className="mt-4 font-display text-5xl text-white sm:text-6xl">{editingId ? 'Refine a platform update before it lands.' : 'Broadcast platform news with a more premium editorial tone.'}</h1>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Publish launches, editions, appearances, and platform updates from a workspace that matches the rest of the NovaLibra experience.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,26,0.9),rgba(9,13,26,0.58))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
            <div className="space-y-4">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <RadioTower className="h-5 w-5 text-brand-gold" />
                  <div>
                    <p className="text-2xl font-semibold text-white">{announcements.length}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Published updates</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-300">
                Strong announcements feel editorial, clear, and worth pausing for.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="admin-grid">
        <section className="page-hero-shell overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,174,98,0.1),transparent_24%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-fuchsia-300" />
              <div>
                <p className="eyebrow">Editor</p>
                <h2 className="mt-2 font-display text-4xl text-white">{editingId ? 'Refine platform update' : 'Publish a new announcement'}</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400">Use announcements to keep members informed about launches, editions, appearances, and platform news.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              <Input label="Content" textarea rows={7} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} />
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update' : 'Publish'}</Button>
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
              <p className="eyebrow">Announcement feed</p>
              <h2 className="mt-3 font-display text-3xl text-white">Published updates</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
              {announcements.length} total
            </span>
          </div>
          {loading ? (
            <SkeletonList count={3} />
          ) : announcements.length ? (
            announcements.map((announcement) => (
              <article key={announcement.id} className="page-hero-shell overflow-hidden p-6 transition duration-300 hover:-translate-y-0.5 hover:border-white/15">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,174,98,0.08),transparent_20%)]" />
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Published update</p>
                    <h2 className="mt-2 font-display text-3xl text-white">{announcement.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{announcement.content}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingId(announcement.id);
                        setForm({ title: announcement.title, content: announcement.content });
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(announcement.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <EmptyState title="No announcements yet" copy="Publish the first platform update from the editor panel." icon={<MegaphoneOff className="h-5 w-5" />} />
          )}
        </section>
      </div>
    </div>
  );
}
