import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { Shield, FileText, AlertTriangle, Key, Users } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HIPAA Compliance - Admin Dashboard',
  description: 'HIPAA compliance management dashboard with audit logs, encryption, and BAA management',
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
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <Shield className="h-8 w-8 text-primary-600" />
                      <span className="ml-2 text-xl font-bold text-gray-900">
                        HIPAA Compliance
                      </span>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                      <Link
                        href="/"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary-500"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Audit Logs
                      </Link>
                      <Link
                        href="/baa"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        BAA
                      </Link>
                      <Link
                        href="/breaches"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300"
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Breaches
                      </Link>
                      <Link
                        href="/encryption"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300"
                      >
                        <Key className="h-4 w-4 mr-1" />
                        Encryption
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
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
