import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/index.css';
import '../styles/tailwind.css';
import { AuthProvider } from '../lib/context';
import { LibraryProvider } from '../lib/libraryContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'LibraMS - Library Management System',
  description: 'A comprehensive Library Management System for managing books, borrowing, fines, and more.',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LibraryProvider>
            {children}
          </LibraryProvider>
        </AuthProvider>

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Flibrams3241back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.19" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
    </html>
  );
}
