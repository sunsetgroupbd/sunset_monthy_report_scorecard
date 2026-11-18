import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Manual Monthly Scorecard Management System',
  description: 'Enterprise Performance, Collection Forecasting, and Portfolio Snapshot Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
