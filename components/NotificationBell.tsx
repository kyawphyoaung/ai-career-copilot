// components/NotificationBell.tsx
"use client";

import { useState, useEffect } from 'react';
import { CalendarClock } from 'lucide-react';
import Link from 'next/link';

export default function NotificationBell() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const response = await fetch('/api/follow-ups/pending');
        if (response.ok) {
          const data = await response.json();
          setPendingCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch notification count", error);
      }
    }
    // Fetch count on initial load and then every minute
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 60000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/history" className="hover:text-blue-500 relative">
        <CalendarClock className="h-6 w-6" />
        <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white ${pendingCount > 0 ? 'bg-red-500' : 'bg-gray-400 dark:bg-gray-600'}`}>
            {pendingCount}
        </span>
    </Link>
  );
}
