// File: app/history/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CvPreview from '@/components/CvPreview';

export default function ApplicationDetailPage() {
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    if (!id) return;

    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/applications/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch application details');
        }
        const data = await response.json();
        setApplication(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  if (isLoading) {
    return <div className="p-8 text-white">Loading application details...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-400">Error: {error}</div>;
  }

  if (!application) {
    return <div className="p-8 text-white">Application not found.</div>;
  }

  return (
    <div className="p-8 h-full">
        <Link href="/history" className="text-indigo-400 hover:underline mb-6 block">&larr; Back to History</Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-100px)]">
            {/* Left Panel: Details */}
            <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg overflow-y-auto">
                <h1 className="text-2xl font-bold text-white mb-2">{application.jobTitle}</h1>
                <h2 className="text-xl font-semibold text-indigo-400 mb-4">{application.companyName}</h2>

                <div className="space-y-4 text-sm">
                    <div><strong className="text-gray-400">Country:</strong> {application.country}</div>
                    <div><strong className="text-gray-400">Source:</strong> {application.source}</div>
                    <div><strong className="text-gray-400">Applied on:</strong> {new Date(application.appliedAt).toLocaleDateString()}</div>
                     <div><strong className="text-gray-400">Status:</strong> {application.status}</div>
                    {application.contactEmail && <div><strong className="text-gray-400">HR Email:</strong> {application.contactEmail}</div>}
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-2 border-t border-gray-700 pt-4">Original Job Description</h3>
                <div className="text-xs text-gray-300 bg-gray-900 p-4 rounded max-h-96 overflow-y-auto whitespace-pre-wrap">
                    {application.jobDescription}
                </div>
            </div>

            {/* Right Panel: CV Preview */}
            <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                <CvPreview 
                    cvData={application.generatedCvJson} 
                    initialTemplate={application.cvThemeUsed}
                />
            </div>
        </div>
    </div>
  );
}