// File: components/CvPreview.tsx
'use client';

import { useState, forwardRef, useEffect } from 'react';

// Define the props for the component
interface CvPreviewProps {
  cvData: any;
  // Make onTemplateChange optional for read-only views
  onTemplateChange?: (template: string) => void;
  // Allow passing an initial template
  initialTemplate?: string; 
}

const CvPreview = forwardRef<HTMLDivElement, CvPreviewProps>(({ cvData, onTemplateChange, initialTemplate = 'template2' }, ref) => {
  const [activeTemplate, setActiveTemplate] = useState(initialTemplate);

  useEffect(() => {
      setActiveTemplate(initialTemplate);
  }, [initialTemplate]);

  const handleTemplateChange = (template: string) => {
    setActiveTemplate(template);
    if(onTemplateChange) {
        onTemplateChange(template);
    }
  };

  if (!cvData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>CV Preview will appear here...</p>
      </div>
    );
  }

  // Destructure with default values to prevent errors
  const { name = '', contact = {}, summary = '', skills = [], experience = [], education = {}, leadership = {} } = cvData;

  const contactLinks = `
    <a href="mailto:${contact.email}" class="hover:underline">${contact.email}</a> | 
    <a href="${contact.linkedin}" target="_blank" class="hover:underline">LinkedIn</a> | 
    <a href="${contact.github}" target="_blank" class="hover:underline">GitHub</a>`;

  let skillsHTML = `<div class="section skills-section"><h2 class="section-title">Skills</h2><div class="skills-container">` +
    (skills?.map((s: any) => `
        <div class="skill-category">
            <h3>${s.category}</h3>
            <ul>${s.items.split(',').map((item: string) => `<li>${item.trim()}</li>`).join('')}</ul>
        </div>`).join('') || '') +
    `</div></div>`;

  let experienceHTML = `<div class="section"><h2 class="section-title">Work Experience</h2>` +
                       (experience?.map((job: any) => `
                           <div class="job">
                               <div class="job-header">
                                   <h3 class="job-title">${job.title}</h3>
                                   <span class="job-date">${job.date}</span>
                               </div>
                               <p class="job-company">${job.company}</p>
                               <ul>${(job.points || []).map((p: string) => `<li>${p}</li>`).join('')}</ul>
                           </div>`).join('') || '') +
                       `</div>`;

  let educationHTML = `<div class="section"><h2 class="section-title">Education</h2><div class="education-entry"><p><strong>${education.degree}</strong>, ${education.university} (${education.gradYear})</p><p>${education.gpa || ''}</p></div></div>`;
  
  let leadershipHTML = `<div class="section"><h2 class="section-title">Leadership</h2><p><strong>${leadership.role}</strong> (${leadership.organization || leadership.description}, ${leadership.date})</p></div>`;

  let summaryHTML = `<div class="section"><h2 class="section-title">Professional Summary</h2><p class="summary-text">${summary}</p></div>`;
  
  let eduLeadHTML = `<div class="edu-lead-grid">${educationHTML}${leadershipHTML}</div>`;
  
  let finalHtml = '';

    if (activeTemplate === 'template1') { // Classic
        finalHtml = `
        <style>
            .cv-preview-content.template1 { font-family: 'Merriweather', serif; color: #212529; }
            .cv-preview-content.template1 a { color: white; }
            .cv-preview-content.template1 .header { text-align: center; background: #003366; color: white; padding: 20px 0;}
            .cv-preview-content.template1 .header-content { padding: 0 1cm; }
            .cv-preview-content.template1 h1 { margin: 0; font-size: 2.2em; }
            .cv-preview-content.template1 .contact-info { margin-top: 8px; font-size: 0.9em;}
            .cv-preview-content.template1 .content-body { padding: 15px 0 0 0; }
            .cv-preview-content.template1 .section-title { color: #003366; font-size: 1.2em; border-bottom: 2px solid #003366; padding-bottom: 4px; margin-bottom: 8px; }
            .cv-preview-content.template1 .job-header { display: flex; justify-content: space-between; align-items: baseline; }
            .cv-preview-content.template1 .job-title { font-size: 1.05em; font-weight: bold; }
            .cv-preview-content.template1 .job-company { font-style: italic; color: #212529; margin: 0 0 8px 0; }
            .cv-preview-content.template1 ul { padding-left: 20px; }
            .cv-preview-content.template1 .summary-text, .cv-preview-content.template1 p { color: #212529; }
            .cv-preview-content.template1 .skills-container { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .cv-preview-content.template1 .skill-category h3 { margin-bottom: 6px; font-size: 1em; }
            .cv-preview-content.template1 .skill-category ul { display: flex; flex-wrap: wrap; gap: 6px; list-style: none; padding: 0; }
            .cv-preview-content.template1 .skill-category li { background-color: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; color: #212529; }
            .cv-preview-content.template1 .edu-lead-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        </style>
        <div class="header"><div class="header-content"><h1>${name}</h1><div class="contact-info">${contact.phone} | ${contactLinks}</div></div></div>
        <div class="content-body">
            ${summaryHTML}
            ${skillsHTML}
            ${experienceHTML}
            ${eduLeadHTML}
        </div>
        `;
    } else if (activeTemplate === 'template2') { // Modern
        finalHtml = `
        <style>
            .cv-preview-content.template2 { display: flex; gap: 20px; font-family: 'Lato', sans-serif; color: #212529; }
            .cv-preview-content.template2 a { color: #212529; text-decoration: none; }
            .cv-preview-content.template2 .t2-header { text-align: left; margin-bottom: 15px;}
            .cv-preview-content.template2 .t2-header h1 { font-size: 2.2em; color: #003366; margin: 0 0 5px 0; }
            .cv-preview-content.template2 .t2-header .contact-info { font-size: 0.9em; color: #212529; }
            .cv-preview-content.template2 .t2-main { flex: 2.5; }
            .cv-preview-content.template2 .t2-sidebar { flex: 1.5; }
            .cv-preview-content.template2 .section-title { font-size: 1.1em; color: #003366; border-bottom: 2px solid #003366; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; }
            .cv-preview-content.template2 .skill-category ul { display: flex; flex-wrap: wrap; gap: 6px; list-style: none; padding: 0; }
            .cv-preview-content.template2 .skill-category li { background-color: #e9ecef; color: #212529; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; }
            .cv-preview-content.template2 .job ul { padding-left: 20px; color: #212529; }
            .cv-preview-content.template2 .summary-text, .cv-preview-content.template2 p { color: #212529; }
        </style>
        <div class="t2-main">
            <div class="t2-header"><h1>${name}</h1><div class="contact-info">${contact.phone} | ${contactLinks}</div></div>
            ${summaryHTML}
            ${experienceHTML}
        </div>
        <div class="t2-sidebar">
            ${skillsHTML}
            ${educationHTML}
            ${leadershipHTML}
        </div>`;
    } else if (activeTemplate === 'template3') { // Minimalist
        finalHtml = `
        <style>
            .cv-preview-content.template3 { font-family: 'Roboto', sans-serif; color: #212529; }
            .cv-preview-content.template3 .header { text-align: left; padding-bottom: 10px; border-bottom: 2px solid #333; margin-bottom: 15px; }
            .cv-preview-content.template3 h1 { font-size: 2.2em; margin: 0; }
            .cv-preview-content.template3 .contact-info { margin-top: 5px; color: #212529; }
            .cv-preview-content.template3 a { color: #212529; }
            .cv-preview-content.template3 .section { padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid #eee; }
            .cv-preview-content.template3 .section:last-child { border-bottom: none; }
            .cv-preview-content.template3 .section-title { font-size: 1em; text-transform: uppercase; letter-spacing: 2px; border: none; font-weight: bold; margin-bottom: 8px; }
            .cv-preview-content.template3 ul { list-style-type: '- '; padding-left: 15px; }
            .cv-preview-content.template3 .skill-category ul { display: flex; flex-wrap: wrap; gap: 6px; list-style: none; padding: 0; }
            .cv-preview-content.template3 .skill-category li { background-color: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; color: #212529; }
            .cv-preview-content.template3 .summary-text, .cv-preview-content.template3 p { color: #212529; }
        </style>
        <div class="header"><h1>${name}</h1><div class="contact-info">${contact.phone} | ${contactLinks}</div></div>
        ${summaryHTML}
        ${experienceHTML}
        ${skillsHTML}
        ${educationHTML}
        ${leadershipHTML}
        `;
    }

  return (
    <div className="h-full flex flex-col">
        {/* Controls */}
        <div className="flex-shrink-0 mb-4 p-2 bg-gray-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">Template:</span>
                <button onClick={() => handleTemplateChange('template1')} disabled={!onTemplateChange} className={`px-3 py-1 text-sm rounded ${activeTemplate === 'template1' ? 'bg-indigo-600 text-white' : 'bg-gray-600'} disabled:opacity-50`}>Classic</button>
                <button onClick={() => handleTemplateChange('template2')} disabled={!onTemplateChange} className={`px-3 py-1 text-sm rounded ${activeTemplate === 'template2' ? 'bg-indigo-600 text-white' : 'bg-gray-600'} disabled:opacity-50`}>Modern</button>
                <button onClick={() => handleTemplateChange('template3')} disabled={!onTemplateChange} className={`px-3 py-1 text-sm rounded ${activeTemplate === 'template3' ? 'bg-indigo-600 text-white' : 'bg-gray-600'} disabled:opacity-50`}>Minimalist</button>
            </div>
            <button onClick={() => window.print()} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                Download as PDF
            </button>
        </div>

        {/* A4 Preview Area */}
        <div className="flex-grow bg-gray-500 overflow-y-auto p-4 rounded">
            <div 
                ref={ref}
                id="cv-render-area" 
                className="w-[210mm] min-h-fit bg-white p-[1cm] shadow-lg mx-auto"
                dangerouslySetInnerHTML={{ __html: `<div class="cv-preview-content ${activeTemplate}">${finalHtml}</div>` }}
            />
        </div>
    </div>
  );
});

CvPreview.displayName = "CvPreview";
export default CvPreview;

