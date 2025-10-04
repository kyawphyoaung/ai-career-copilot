// components/CvPreview.tsx

import React from 'react';

// CV data အတွက် TypeScript interface များ သတ်မှတ်ခြင်း
interface PersonalInfo {
  name: string;
  phone: string;
  email: string;
  linkedinUrl: string;
  githubUrl: string;
}

interface Experience {
  jobTitle: string;
  companyName: string;
  duration: string;
  responsibilities: string;
}

interface Skill {
  category: string;
  items: string;
}

interface Education {
    degree: string;
    university: string;
    duration: string;
}

interface Leadership {
    organization: string;
    role: string;
    duration: string;
    details: string;
}

interface CvData {
  personalInfo: PersonalInfo;
  summary: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  leadership: Leadership[];
}

interface CvPreviewProps {
  cvData: CvData;
  theme?: string;
}

// <<<<<<< Component ကို forwardRef ဖြင့် ပြင်ဆင်ရေးသားခြင်း >>>>>>>>>
const CvPreview = React.forwardRef<HTMLDivElement, CvPreviewProps>(({ cvData, theme = 'modern' }, ref) => {
  if (!cvData) return null;

  const { personalInfo = {}, summary, skills = [], experience = [], education = [], leadership = [] } = cvData;
  const { name, phone, email, linkedinUrl, githubUrl } = personalInfo;

  const themeClasses = {
    modern: {
      container: 'font-sans',
      header: 'bg-gray-800 text-white p-6 rounded-t-lg',
      name: 'text-3xl font-bold',
      contact: 'text-sm mt-2',
      sectionTitle: 'text-xl font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-3',
      body: 'p-6',
    },
    classic: {
      container: 'font-serif',
      header: 'text-center p-6 border-b-2 border-black',
      name: 'text-4xl font-bold tracking-wider',
      contact: 'text-md mt-2',
      sectionTitle: 'text-xl font-bold uppercase tracking-wider border-b border-black pb-1 mb-3',
      body: 'p-6',
    },
  };

  const currentTheme = theme === 'classic' ? themeClasses.classic : themeClasses.modern;

  return (
    // <<<<<<< Ref ကို root element တွင် ချိတ်ဆက်ခြင်း >>>>>>>>>
    <div ref={ref} className={`cv-preview-a4 bg-white text-black shadow-lg mx-auto ${currentTheme.container}`}>
      <header className={currentTheme.header}>
        <h1 className={currentTheme.name}>{name}</h1>
        <div className={currentTheme.contact}>
          <span>{phone}</span> | <span>{email}</span> | <span>{linkedinUrl}</span> | <span>{githubUrl}</span>
        </div>
      </header>
      <section className={currentTheme.body}>
        <div>
          <h2 className={currentTheme.sectionTitle}>Summary</h2>
          <p>{summary}</p>
        </div>
        <div className="mt-4">
          <h2 className={currentTheme.sectionTitle}>Skills</h2>
          <div className="grid grid-cols-2 gap-4">
            {skills.map((skill, index) => (
              <div key={index}>
                <h3 className="font-bold">{skill.category}</h3>
                <p>{skill.items}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <h2 className={currentTheme.sectionTitle}>Experience</h2>
          {experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-bold">{exp.jobTitle}</h3>
              <p className="font-semibold">{exp.companyName} | {exp.duration}</p>
              <ul className="list-disc list-inside mt-1">
                {exp.responsibilities.split('\n').map((item, i) => item.trim() && <li key={i}>{item.trim()}</li>)}
              </ul>
            </div>
          ))}
        </div>
         <div className="mt-4">
          <h2 className={currentTheme.sectionTitle}>Education</h2>
          {education.map((edu, index) => (
            <div key={index} className="mb-2">
              <h3 className="text-lg font-bold">{edu.degree}</h3>
              <p className="font-semibold">{edu.university} | {edu.duration}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h2 className={currentTheme.sectionTitle}>Leadership & Activities</h2>
           {leadership.map((lead, index) => (
            <div key={index} className="mb-2">
              <h3 className="text-lg font-bold">{lead.organization} - <span className="font-semibold">{lead.role}</span></h3>
               <p className="italic">{lead.duration}</p>
              <p>{lead.details}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
});

CvPreview.displayName = 'CvPreview';

export default CvPreview;

