// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Bell, FileText, User, BarChart2 } from 'lucide-react'; // Assuming lucide-react is installed

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Career Co-Pilot",
  description: "Your intelligent partner for job applications",
};

// This is a server component, but we can have a client component inside for fetching data
async function NotificationBell() {
  // In a real app, you'd fetch this data. For now, we'll simulate.
  // const response = await fetch('/api/follow-ups/pending-count');
  // const data = await response.json();
  const pendingCount = 3; // Simulated count

  return (
    <div className="relative">
      <Bell className="h-6 w-6" />
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {pendingCount}
        </span>
      )}
    </div>
  )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                AI Career Co-Pilot
              </Link>
              <div className="flex items-center space-x-6">
                <Link href="/history" className="hover:text-blue-500 flex items-center gap-2"><FileText size={20} /> History</Link>
                <Link href="/dashboard" className="hover:text-blue-500 flex items-center gap-2"><BarChart2 size={20}/> Dashboard</Link>
                <Link href="/profile" className="hover:text-blue-500 flex items-center gap-2"><User size={20}/> Profile</Link>
                {/* <<<<<<< Notification Icon >>>>>>>>> */}
                <button className="hover:text-blue-500 relative">
                  <NotificationBell />
                </button>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}

