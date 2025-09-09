import React from 'react';
import Link from 'next/link';
import { Home, Folder, BarChart2, FileText } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4">
        <div className="flex items-center mb-8">
          <Link href="/" className="text-2xl font-bold">
            Time Tracker
          </Link>
        </div>
        <nav>
          <ul>
            <li>
              <Link href="/" className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                <Home className="mr-2" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/projects" className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                <Folder className="mr-2" />
                Projects
              </Link>
            </li>
            <li>
              <Link href="/reports" className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                <BarChart2 className="mr-2" />
                Reports
              </Link>
            </li>
            <li>
              <Link href="/invoicing" className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                <FileText className="mr-2" />
                Invoicing
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-4">
          <ThemeToggle />
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
