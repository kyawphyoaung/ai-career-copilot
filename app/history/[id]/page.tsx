// app/history/[id]/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Briefcase, Building, Calendar, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';

type Application = {
  id: number;
  companyName: string;
  jobTitle: string;
  appliedAt: string;
  status: 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED';
  followUp: boolean;
  followUpDate: string | null;
  followUpCompleted: boolean;
  contactEmail: string | null;
  cvPdfFilename: string;
  jobDescription: string;
};

const statusColors: { [key: string]: { bg: string; text: string; border: string } } = {
  APPLIED: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-500' },
  INTERVIEWING: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-500' },
  OFFER: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300', border: 'border-green-500' },
  REJECTED: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300', border: 'border-red-500' },
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      async function fetchApplication() {
        try {
          setLoading(true);
          const response = await fetch(`/api/applications/${id}`);
          if (!response.ok) throw new Error('Application not found');
          const data = await response.json();
          setApplication(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchApplication();
    }
  }, [id]);

  const updateStatus = async (newStatus: Application['status']) => {
    if (!application) return;
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      const updatedApp = await response.json();
      setApplication(updatedApp);
    } catch (err) {
      alert('Error updating status.');
    }
  };
  
  const toggleFollowUpCompleted = async () => {
    if (!application) return;
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpCompleted: !application.followUpCompleted }),
      });
      if (!response.ok) throw new Error('Failed to update follow-up status');
      const updatedApp = await response.json();
      setApplication(updatedApp);
    } catch (err) {
      alert('Error updating follow-up status.');
    }
  };

  if (loading) return <div className="text-center p-10">Loading application details...</div>;
  if (error || !application) return <div className="text-center p-10 text-red-500">Error: Application not found.</div>;

  const currentStatusStyle = statusColors[application.status];
  
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className={`p-6 border-l-4 ${currentStatusStyle.border} ${currentStatusStyle.bg}`}>
          <div className="flex items-center gap-4">
            <Building size={32} className={currentStatusStyle.text} />
            <div>
              {/* <<<<<<< Dark Mode Text Color Fix >>>>>>>>> */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{application.jobTitle}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">{application.companyName}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar size={16} />
            {/* <<<<<<< Dark Mode Text Color Fix >>>>>>>>> */}
            <span>Applied on {new Date(application.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Job Description</h3>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed max-h-60 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                {application.jobDescription}
              </p>
            </div>
             <div>
              <h3 className="font-semibold text-lg mb-2">Submitted CV</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{application.cvPdfFilename}</p>
            </div>
          </div>

          {/* Right Column - Actions & Status */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Update Status</h3>
              <div className="flex flex-col space-y-2">
                {Object.keys(statusColors).map(status => (
                  <button key={status} onClick={() => updateStatus(status as Application['status'])}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-transform transform hover:scale-105
                      ${application.status === status 
                        ? `${statusColors[status].bg.replace('100', '200')} ${statusColors[status].text} border ${statusColors[status].border}` 
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {application.followUp && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Follow-up Reminder</h3>
                <div className="text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                   <div className="flex items-center gap-2">
                    <Clock size={16}/>
                    <span>Due on: {application.followUpDate ? new Date(application.followUpDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="mt-3">
                    <button onClick={toggleFollowUpCompleted}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg
                        ${application.followUpCompleted
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}
                    >
                      {application.followUpCompleted ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                      <span>{application.followUpCompleted ? 'Follow-up Done' : 'Mark as Done'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
             {application.contactEmail && (
                <div>
                   <h3 className="font-semibold text-lg mb-2">Contact</h3>
                   <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} />
                       <a href={`mailto:${application.contactEmail}`} className="text-blue-500 hover:underline">{application.contactEmail}</a>
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

