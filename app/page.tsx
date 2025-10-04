// File: app/page.tsx
'use client';

import { useState, useRef } from 'react';
import CvPreview from '@/components/CvPreview';

export default function DashboardPage() {
  // --- States for CV Generation ---
  const [jobDescription, setJobDescription] = useState('');
  const [generatedCv, setGeneratedCv] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- States for Saving Application ---
  const [appDetails, setAppDetails] = useState({
      companyName: '',
      jobTitle: '',
      country: 'Singapore',
      source: 'LinkedIn',
      contactEmail: ''
  });
  const [cvTheme, setCvTheme] = useState('template2');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleAppDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setAppDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setGeneratedCv(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate CV');
      }

      const data = await response.json();
      setGeneratedCv(data);
      
      // *** NEW: Auto-fill the save form with AI-generated data ***
      if (data.experience && data.experience.length > 0) {
        setAppDetails(prev => ({
            ...prev,
            jobTitle: data.experience[0].title || 'Software Engineer',
            companyName: data.experience[0].company || ''
        }));
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApplication = async () => {
    if (!generatedCv) return;
    setIsSaving(true);
    setSaveMessage('');

    const payload = {
        ...appDetails,
        jobDescription,
        generatedCvJson: generatedCv,
        cvThemeUsed: cvTheme
    };

    try {
        const response = await fetch('/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to save application');

        setSaveMessage('Application saved successfully!');
    } catch (err) {
        setSaveMessage('Error saving application.');
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <div className="p-8 h-full">
      <h1 className="text-3xl font-bold mb-6 text-white">CV Generator Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-100px)]">
        {/* Left Panel: Input */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col">
          <form onSubmit={handleGenerateSubmit} className="flex flex-col h-full">
            <label htmlFor="jobDescription" className="block text-xl font-semibold mb-4 text-white">
              1. Paste Job Description
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full flex-grow p-4 border border-gray-600 bg-gray-700 text-gray-200 rounded font-mono text-sm"
              placeholder="Paste the full job description from LinkedIn, etc."
            />
            <button
              type="submit"
              disabled={isLoading || !jobDescription}
              className="mt-6 w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate Tailored CV'}
            </button>
            {error && <p className="mt-4 text-red-400">{error}</p>}
          </form>
        </div>

        {/* Right Panel: Output & Save */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-white">2. Review & Save Application</h2>
          <div className="flex-grow h-0">
             <CvPreview 
                cvData={generatedCv} 
                onTemplateChange={setCvTheme} 
             />
          </div>
          {generatedCv && (
            <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <input type="text" name="companyName" value={appDetails.companyName} onChange={handleAppDetailsChange} placeholder="Company Name" className="p-2 bg-gray-700 rounded border border-gray-600 text-white"/>
                    <input type="text" name="jobTitle" value={appDetails.jobTitle} onChange={handleAppDetailsChange} placeholder="Job Title" className="p-2 bg-gray-700 rounded border border-gray-600 text-white"/>
                    <select name="country" value={appDetails.country} onChange={handleAppDetailsChange} className="p-2 bg-gray-700 rounded border border-gray-600 text-white">
                        <option>Singapore</option>
                        <option>Bangkok</option>
                        <option>Other</option>
                    </select>
                     <select name="source" value={appDetails.source} onChange={handleAppDetailsChange} className="p-2 bg-gray-700 rounded border border-gray-600 text-white">
                        <option>LinkedIn</option>
                        <option>Company Website</option>
                        <option>JobStreet</option>
                        <option>Email</option>
                    </select>
                    <input type="email" name="contactEmail" value={appDetails.contactEmail} onChange={handleAppDetailsChange} placeholder="HR Email (Optional)" className="p-2 bg-gray-700 rounded border border-gray-600 col-span-2 text-white"/>
                </div>
                <button onClick={handleSaveApplication} disabled={isSaving} className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-500">
                    {isSaving ? 'Saving...' : 'Confirm & Save Application to History'}
                </button>
                {saveMessage && <p className="mt-2 text-center text-green-400">{saveMessage}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

