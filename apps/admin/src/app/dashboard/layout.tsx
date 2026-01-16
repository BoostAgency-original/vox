'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await api.logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 py-4 px-6 sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <h1 className="text-xl font-bold">
              <span className="text-gradient-female">V</span>
              <span className="text-white">o</span>
              <span className="text-gradient-male">x</span>
            </h1>
            <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-400 font-medium">
              ADMIN
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Выйти
          </button>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

