import { Crown, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/Skeleton';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get('/admin/users')
      .then(({ data }) => setUsers(data.users))
      .catch((apiError) => {
        setError(apiError.response?.data?.message || 'Unable to load users.');
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleFeaturedAuthor(userId) {
    const { data } = await api.patch(`/admin/users/${userId}/feature-author`);
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              isFeaturedAuthor: data.user.isFeaturedAuthor
            }
          : user
      )
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <EmptyState title="Users unavailable" copy={error} />
      </div>
    );
  }

  return (
    <div className="page-shell space-y-8">
      <section className="page-hero-shell overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
        <div className="absolute inset-0 hero-ambient opacity-75" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Member directory</p>
            <h1 className="mt-4 font-display text-5xl text-white sm:text-6xl">See who is shaping the platform, with a more elevated operations view.</h1>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Monitor community growth, scan engagement patterns, and feature standout authors without the admin experience dropping back into plain utility styling.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/10 px-5 py-4 backdrop-blur-sm">
            <p className="text-3xl font-semibold text-white">{users.length}</p>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Accounts loaded</p>
          </div>
        </div>
      </section>

      <div className="mt-2">
        {loading ? (
          <SkeletonList count={4} />
        ) : users.length ? (
          <div className="page-hero-shell overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,174,98,0.08),transparent_20%)]" />
            <div className="relative data-table-shell overflow-x-auto rounded-none border-0 bg-transparent shadow-none">
              <table className="min-w-full divide-y divide-white/10 text-left">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.25em] text-slate-400">
                  <tr>
                    <th className="px-6 py-5">Member</th>
                    <th className="px-6 py-5">Role</th>
                    <th className="px-6 py-5">Comments</th>
                    <th className="px-6 py-5">Favorites</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-brand-900/30 text-sm text-slate-300">
                  {users.map((user) => (
                    <tr key={user.id} className="transition hover:bg-white/[0.04]">
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="mt-1 text-slate-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                            {user.role}
                          </span>
                          {user.role === 'AUTHOR' ? (
                            <Button variant={user.isFeaturedAuthor ? 'primary' : 'secondary'} size="sm" onClick={() => handleToggleFeaturedAuthor(user.id)}>
                              {user.isFeaturedAuthor ? 'Featured author' : 'Feature author'}
                            </Button>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-5 font-medium text-white">{user._count.comments}</td>
                      <td className="px-6 py-5 font-medium text-white">{user._count.favorites}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState title="No members yet" copy="Accounts will appear here once registration starts." icon={<UsersRound className="h-5 w-5" />} />
        )}
      </div>

      {!loading && users.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <UsersRound className="h-5 w-5 text-brand-gold" />
              <div>
                <p className="text-2xl font-semibold text-white">{users.filter((user) => user.role === 'READER').length}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Readers</p>
              </div>
            </div>
          </div>
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-fuchsia-300" />
              <div>
                <p className="text-2xl font-semibold text-white">{users.filter((user) => user.role === 'AUTHOR').length}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Authors</p>
              </div>
            </div>
          </div>
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-cyan-300" />
              <div>
                <p className="text-2xl font-semibold text-white">{users.filter((user) => user.role === 'AUTHOR' && user.isFeaturedAuthor).length}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Featured authors</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
