'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { AdminStats, PaginatedSessions } from '@vox/shared';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [sessions, setSessions] = useState<PaginatedSessions | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  const loadData = async () => {
    try {
      const [statsData, sessionsData] = await Promise.all([
        api.getStats(),
        api.getSessions({ page, limit: 20, search: search || undefined, status: statusFilter || undefined }),
      ]);
      setStats(statsData);
      setSessions(sessionsData);
    } catch (err) {
      router.push('/');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  if (!stats || !sessions) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="audio-wave text-gray-400">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-500/20 text-gray-400',
    uploading: 'bg-yellow-500/20 text-yellow-400',
    analyzing: 'bg-blue-500/20 text-blue-400',
    complete: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Ожидание',
    uploading: 'Загрузка',
    analyzing: 'Анализ',
    complete: 'Готово',
    failed: 'Ошибка',
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Всего', value: stats.totalSessions, icon: '📊' },
          { label: 'Завершено', value: stats.completedSessions, color: 'text-green-400', icon: '✅' },
          { label: 'В процессе', value: stats.analyzingSessions, color: 'text-blue-400', icon: '⏳' },
          { label: 'Ошибки', value: stats.failedSessions, color: 'text-red-400', icon: '❌' },
          { label: 'Сегодня', value: stats.todaySessions, icon: '📅' },
          { label: 'За неделю', value: stats.weekSessions, icon: '📆' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{stat.icon}</span>
              <span className="text-gray-400 text-sm">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color || 'text-white'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по email или имени..."
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Найти
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
        >
          <option value="">Все статусы</option>
          <option value="pending">Ожидание</option>
          <option value="uploading">Загрузка</option>
          <option value="analyzing">Анализ</option>
          <option value="complete">Готово</option>
          <option value="failed">Ошибка</option>
        </select>

        <div className="flex gap-2">
          <a
            href={api.getExportUrl('contacts')}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <span>📥</span> Контакты
          </a>
          <a
            href={api.getExportUrl('full')}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <span>📦</span> Полный
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Она</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Он</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Статус</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Дата</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Результат</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sessions.data.map((session) => (
                <tr key={session.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white text-sm">{session.email}</td>
                  <td className="px-4 py-3 text-female-400 text-sm">{session.femaleName || '—'}</td>
                  <td className="px-4 py-3 text-male-400 text-sm">{session.maleName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[session.status]}`}>
                      {statusLabels[session.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {new Date(session.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {session.status === 'complete' && (
                      <div className="flex gap-2 text-xs">
                        <span className="text-female-400">{session.comfortFm}%</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-male-400">{session.comfortMf}%</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/sessions/${session.id}`}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded transition-colors"
                    >
                      Детали →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {sessions.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-gray-400 text-sm">
              Страница {sessions.page} из {sessions.totalPages} (всего: {sessions.total})
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>
              <button
                onClick={() => setPage((p) => Math.min(sessions.totalPages, p + 1))}
                disabled={page === sessions.totalPages}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

