// app/history/page.tsx

"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowUpDown, AlertCircle } from 'lucide-react';

type Application = {
  id: number;
  companyName: string;
  jobTitle: string;
  appliedAt: string;
  status: 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED';
  followUp: boolean;
  followUpDate: string | null;
  followUpCompleted: boolean;
};

const statusColors: { [key: string]: string } = {
  APPLIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  INTERVIEWING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  OFFER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function HistoryPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Application; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoading(true);
        const response = await fetch('/api/applications');
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data = await response.json();
        setApplications(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  const sortedAndFilteredApplications = useMemo(() => {
    let filtered = applications.filter(app =>
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [applications, searchTerm, sortConfig]);
  
  const requestSort = (key: keyof Application) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  if (loading) return <div className="text-center p-10">Loading applications...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Application History</h1>
      
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search by company or job title..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['ID', 'Company', 'Job Title'].map(header => (
                 <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
              ))}
               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <button onClick={() => requestSort('appliedAt')} className="flex items-center gap-1">
                  Applied Date <ArrowUpDown size={14}/>
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <button onClick={() => requestSort('followUpDate')} className="flex items-center gap-1">
                  Follow-up Date <ArrowUpDown size={14}/>
                </button>
               </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedAndFilteredApplications.map(app => {
              const needsFollowUp = app.followUp && !app.followUpCompleted && app.followUpDate && new Date(app.followUpDate) <= new Date();
              return (
                <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{app.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                    <Link href={`/history/${app.id}`} className="hover:underline text-blue-600 dark:text-blue-400">{app.companyName}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{app.jobTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {app.followUpDate ? (
                      <div className="flex items-center gap-2">
                        {needsFollowUp && <AlertCircle size={16} className="text-yellow-500" title="Follow-up is due!"/>}
                        <span>{new Date(app.followUpDate).toLocaleDateString()}</span>
                      </div>
                    ) : <span className="text-gray-400 dark:text-gray-500">-</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
       {sortedAndFilteredApplications.length === 0 && (
          <div className="text-center py-10 text-gray-500">No applications found.</div>
        )}
    </div>
  );
}

