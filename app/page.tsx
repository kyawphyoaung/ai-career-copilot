// app/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-json";
import CvPreview from "@/components/CvPreview";
import { sampleCvJson } from "@/lib/sample-cv";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export default function HomePage() {
  const [jd, setJd] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [generatedCv, setGeneratedCv] = useState<any>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvTheme, setCvTheme] = useState('modern');
  const [cvScale, setCvScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const cvPreviewRef = useRef<HTMLDivElement>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [applicationSource, setApplicationSource] = useState("LinkedIn");
  const [applicationCountry, setApplicationCountry] = useState("Singapore");
  const [contactEmail, setContactEmail] = useState("");
  const [wantsFollowUp, setWantsFollowUp] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  const [skillAnalysis, setSkillAnalysis] = useState<{ match: number; required: string[]; missing: string[] } | null>(null);
  const [cvPdfFilename, setCvPdfFilename] = useState("");
  const [userProfileId, setUserProfileId] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);


  useEffect(() => {
    if (jsonText) {
      try {
        const parsedJson = JSON.parse(jsonText);
        setGeneratedCv(parsedJson);
        const name = parsedJson?.personalInfo?.name?.replace(/\s+/g, '_') || 'CV';
        const company = companyName.replace(/\s+/g, '_') || 'Resume';
        const timestamp = Date.now();
        setCvPdfFilename(`${name}_${company}_${timestamp}.pdf`);
        setJsonError(null);
      } catch (e) {
        setJsonError("Invalid JSON format.");
        setGeneratedCv(null);
      }
    } else {
      setGeneratedCv(null);
      setJsonError(null);
    }
  }, [jsonText, companyName]);

  useEffect(() => {
    const calculateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth;
        const a4WidthInPx = 210 * (96 / 25.4);
        const scale = (containerWidth * 0.95) / a4WidthInPx;
        setCvScale(scale > 1 ? 1 : scale);
      }
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  useEffect(() => {
    // 💡 ပြင်ဆင်မှု ၂: User Profile ID ကို /api/profile မှ Fetch လုပ်ခြင်း
    const fetchUserProfileId = async () => {
        setIsProfileLoading(true);
        try {
            // သင့်ရဲ့ /api/profile route က လက်ရှိ user ရဲ့ ID ကို ပြန်ပေးမယ်လို့ ယူဆပါတယ်။
            const response = await fetch('/api/profile', { method: 'GET' });
            if (response.ok) {
                const data = await response.json();
                // data.id သို့မဟုတ် data.userProfileId ဖြစ်နိုင်သည်ကို စစ်ဆေးပါ။
                // ဤနေရာတွင် ID ကို String အဖြစ်သာ ယူဆထားပါသည်။
                const id = data.id || data.userProfileId; 
                if (id) {
                    setUserProfileId(String(id));
                    console.log("Fetched User Profile ID:", id);
                } else {
                    setError("User profile ID not available. Cannot proceed with CV generation.");
                }
            } else {
                setError("Failed to fetch user profile data. (Is /api/profile set up?)");
            }
        } catch (err) {
            console.error("Profile fetch error:", err);
            setError("Network error while fetching user profile.");
        } finally {
            setIsProfileLoading(false);
        }
    };
    fetchUserProfileId();
  }, []); 

  
  const handleGenerateCommonCv = () => {
    const transformedCv = JSON.parse(JSON.stringify(sampleCvJson));
    const skillsObject = transformedCv.skills;
    const skillsArray = Object.entries(skillsObject).map(([category, items]) => ({
      category,
      items: Array.isArray(items) ? items.join(', ') : String(items)
    }));
    const experienceArray = transformedCv.experience.map((exp: any) => ({
      ...exp,
      responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities.join('\n') : String(exp.responsibilities)
    }));
    transformedCv.skills = skillsArray;
    transformedCv.experience = experienceArray;
    setJsonText(JSON.stringify(transformedCv, null, 2));
    setSkillAnalysis(null);
    setError(null);
  };

  const handleGenerateTailoredCv = async () => {
    if (!jd.trim()) {
      setError("Job Description cannot be empty.");
      return;
    }

     // userProfileId မရသေးရင် သို့မဟုတ် မရှိရင် ရပ်တန့်ပါ။
    if (!userProfileId) {
        setError("User profile is not loaded or ID is missing. Please refresh.");
        return;
    }

    setLoading(true);
    setError(null);
    setJsonText("");
    setSkillAnalysis(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          jobDescription: jd, 
          companyName, 
          jobTitle,
          userProfileId }),
      });
      if (!response.ok) throw new Error("Failed to generate CV.");
      const data = await response.json();
      setJsonText(JSON.stringify(data.generatedCvJson, null, 2));
      if(data.skillAnalysis) setSkillAnalysis(data.skillAnalysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadPdf = async () => {
    const cvElement = cvPreviewRef.current;
    if (!cvElement) return;
    setLoading(true);
    setError(null);
    try {
      // <<<<<<< PDF Generation Error Fix >>>>>>>>>
      const canvas = await html2canvas(cvElement, { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff' // Force a solid, parsable background color
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      pdf.save(cvPdfFilename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Could not generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApplication = async () => {
      if (!generatedCv || !userProfileId) {
          setError("No CV data or UserID to save.");
          return;
      }
      setLoading(true);
      setError(null);
      setSaveSuccessMessage("");

      let followUpDate = null;
      if (wantsFollowUp) {
          followUpDate = new Date();
          followUpDate.setDate(followUpDate.getDate() + 7);
      }

      try {
          const payload = {
              companyName, jobTitle, jobDescription: jd, generatedCvJson: generatedCv,
              cvThemeUsed: cvTheme, cvPdfFilename, country: applicationCountry,
              source: applicationSource, contactEmail, followUp: wantsFollowUp,
              skillMatchPercentage: skillAnalysis?.match || 0,
              requiredSkills: skillAnalysis?.required || [],
              missingSkills: skillAnalysis?.missing || [],
              userProfileId: userProfileId,
              followUpDate: followUpDate,
          };
          const response = await fetch('/api/applications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to save.');
          }
          setSaveSuccessMessage("Application saved!");
          setTimeout(() => {
              setIsSaveModalOpen(false);
              setSaveSuccessMessage("");
          }, 2000);
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <main className="flex flex-col h-[calc(100vh-65px)]">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">
        {/* Left Side */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">1. Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <input type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
               <input type="text" placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <textarea
              className="w-full p-2 border rounded h-32 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Paste the Job Description here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <div className="flex gap-4 mt-2">
                <button onClick={handleGenerateTailoredCv} disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400">
                    {isProfileLoading ? "Loading Profile..." : loading ? "Processing..." : "Generate Tailored CV (AI)"}
                </button>
                <button onClick={handleGenerateCommonCv} disabled={loading} className="w-full bg-gray-600 text-white p-2 rounded hover:bg-gray-700 disabled:bg-gray-400">
                    Generate Common CV
                </button>
            </div>
            {!userProfileId && !isProfileLoading && (
                 <p className="text-yellow-500 mt-2 text-sm">Cannot generate CV. User Profile ID is missing. (Is /api/profile correct?)</p>
            )}
          </div>
          <div className="bg-[#2d2d2d] p-4 rounded-lg shadow flex-grow flex flex-col">
            <h2 className="text-lg font-semibold mb-2 text-gray-200">2. CV Data (JSON Editor)</h2>
            <div className="editor-container relative flex-grow overflow-y-auto rounded-md" style={{fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 14}}>
                 <Editor
                    value={jsonText}
                    onValueChange={code => setJsonText(code)}
                    highlight={code => highlight(code, languages.json, 'json')}
                    padding={10}
                    style={{ minHeight: '100%', backgroundColor: '#2d2d2d', color: '#f8f8f2' }}
                />
            </div>
             {jsonError && <p className="text-yellow-400 mt-2 text-sm">{jsonError}</p>}
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-y-auto flex flex-col">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-semibold">3. CV Preview</h2>
              <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Theme:</span>
                  <button onClick={() => setCvTheme('modern')} className={`px-3 py-1 text-sm rounded ${cvTheme === 'modern' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Modern</button>
                  <button onClick={() => setCvTheme('classic')} className={`px-3 py-1 text-sm rounded ${cvTheme === 'classic' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Classic</button>
                   {generatedCv && (
                     <>
                      <button onClick={handleDownloadPdf} disabled={loading} className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400">
                          {loading ? '...' : 'Download PDF'}
                      </button>
                       <button onClick={() => setIsSaveModalOpen(true)} disabled={loading} className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400">
                           Save Application
                       </button>
                     </>
                  )}
              </div>
          </div>
           <div 
              ref={previewContainerRef}
              className="flex-grow flex justify-center items-start pt-4 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden"
            >
              {generatedCv ? (
                  <div style={{ transform: `scale(${cvScale})`, transformOrigin: 'top center' }}>
                    <CvPreview ref={cvPreviewRef} cvData={generatedCv} theme={cvTheme} />
                  </div>
              ) : (
                  <div className="text-center py-10 text-gray-500 flex items-center justify-center h-full">
                      <p>CV Preview will appear here.</p>
                  </div>
              )}
           </div>
        </div>
      </div>

      {/* Save Application Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Save Application Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">CV Filename</label>
                <input type="text" value={cvPdfFilename} onChange={(e) => setCvPdfFilename(e.target.value)} className="mt-1 w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
              </div>
              <div>
                <label className="block text-sm font-medium">Country</label>
                <input type="text" value={applicationCountry} onChange={(e) => setApplicationCountry(e.target.value)} className="mt-1 w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
              </div>
              <div>
                <label className="block text-sm font-medium">Source</label>
                 <select value={applicationSource} onChange={(e) => setApplicationSource(e.target.value)} className="mt-1 w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <option>LinkedIn</option>
                    <option>Company Website</option>
                    <option>Job Board</option>
                    <option>Referral</option>
                    <option>Other</option>
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-medium">Contact Email (Optional)</label>
                <input type="email" placeholder="hr@example.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="mt-1 w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
              </div>
              <div className="flex items-center">
                 <input type="checkbox" id="followUp" checked={wantsFollowUp} onChange={(e) => setWantsFollowUp(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
                 <label htmlFor="followUp" className="ml-2 block text-sm">Set a reminder to follow up</label>
              </div>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {saveSuccessMessage && <p className="text-green-500 mt-4">{saveSuccessMessage}</p>}
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 text-sm rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
                Cancel
              </button>
              <button onClick={handleSaveApplication} disabled={loading} className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400">
                {loading ? 'Saving...' : 'Save Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

