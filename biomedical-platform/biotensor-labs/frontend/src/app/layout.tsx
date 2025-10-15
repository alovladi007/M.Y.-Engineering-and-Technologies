import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { FlaskConical, Package, Activity } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BioTensor Labs - MLOps Platform',
  description: 'MLOps platform for biomedical signal processing and experiment tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <FlaskConical className="h-8 w-8 text-primary-600" />
                      <span className="ml-2 text-xl font-bold text-gray-900">
                        BioTensor Labs
                      </span>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                      <Link
                        href="/"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary-500"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/experiments"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300"
                      >
                        <FlaskConical className="h-4 w-4 mr-1" />
                        Experiments
                      </Link>
                      <Link
                        href="/models"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300"
                      >
                        <Package className="h-4 w-4 mr-1" />
                        Models
                      </Link>
                      <Link
                        href="/signals"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300"
                      >
                        <Activity className="h-4 w-4 mr-1" />
                        Signals
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
