import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vox Admin — Панель администратора',
  description: 'Административная панель Vox',
  robots: 'noindex, nofollow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-[#0a0a0f] antialiased">
        {children}
      </body>
    </html>
  );
}

