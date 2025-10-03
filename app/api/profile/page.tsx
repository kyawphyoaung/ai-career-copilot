'use client';

import { useState, useEffect } from 'react';

// Define the structure of the UserProfile data
interface UserProfileData {
  id?: number;
  name: string;
  phone: string;
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  education: { degree: string; university: string; gradYear: string };
  leadership: { role: string; organization: string; date: string };
  masterSkills: { [key: string]: number };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileData>({
    name: '',
    phone: '',
    email: '',
    linkedinUrl: '',
    githubUrl: '',
    education: { degree: '', university: '', gradYear: '' },
    leadership: { role: '', organization: '', date: '' },
    masterSkills: {},
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch existing profile data when the page loads
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          // Convert masterSkills JSON back to string for the textarea
          setSkillsInput(
            Object.entries(data.masterSkills)
              .map(([skill, years]) => `${skill}:${years}`)
              .join('\n')
          );
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'education' | 'leadership') => {
      const { name, value } = e.target;
      setProfile(prev => ({
          ...prev,
          [category]: {
              ...prev[category],
              [name]: value
          }
      }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSkillsInput(e.target.value);
    // Convert the string input into a JSON object for masterSkills
    const skillsObject: { [key: string]: number } = {};
    e.target.value.split('\n').forEach((line) => {
      const [skill, years] = line.split(':');
      if (skill && years && !isNaN(parseInt(years))) {
        skillsObject[skill.trim()] = parseInt(years.trim());
      }
    });
    setProfile((prev) => ({ ...prev, masterSkills: skillsObject }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving...');
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setMessage('Profile saved successfully!');
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message}`);
      }
    } catch (error) {
      setMessage('An unexpected error occurred.');
      console.error('Save failed', error);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <p className="mb-8 text-gray-500">This is your core information. It will be used as the base for all generated CVs.</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Contact Information */}
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block mb-1 font-medium">Full Name</label>
                    <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label htmlFor="email" className="block mb-1 font-medium">Email</label>
                    <input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label htmlFor="phone" className="block mb-1 font-medium">Phone</label>
                    <input type="text" name="phone" value={profile.phone} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                 <div>
                    <label htmlFor="linkedinUrl" className="block mb-1 font-medium">LinkedIn URL</label>
                    <input type="text" name="linkedinUrl" value={profile.linkedinUrl} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                 <div>
                    <label htmlFor="githubUrl" className="block mb-1 font-medium">GitHub URL</label>
                    <input type="text" name="githubUrl" value={profile.githubUrl} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
            </div>
        </div>

        {/* Master Skills */}
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Master Skill Set</h2>
            <p className="text-sm text-gray-500 mb-2">Enter one skill per line in `Skill:Years` format (e.g., React:5).</p>
            <textarea
              value={skillsInput}
              onChange={handleSkillsChange}
              className="w-full p-2 border rounded font-mono"
              rows={10}
            />
        </div>

        {/* Education & Leadership */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Education</h2>
                <div className="space-y-4">
                     <div>
                        <label className="block mb-1 font-medium">Degree</label>
                        <input type="text" name="degree" value={profile.education.degree} onChange={(e) => handleNestedChange(e, 'education')} className="w-full p-2 border rounded" />
                    </div>
                     <div>
                        <label className="block mb-1 font-medium">University</label>
                        <input type="text" name="university" value={profile.education.university} onChange={(e) => handleNestedChange(e, 'education')} className="w-full p-2 border rounded" />
                    </div>
                     <div>
                        <label className="block mb-1 font-medium">Graduation Year</label>
                        <input type="text" name="gradYear" value={profile.education.gradYear} onChange={(e) => handleNestedChange(e, 'education')} className="w-full p-2 border rounded" />
                    </div>
                </div>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Leadership</h2>
                 <div className="space-y-4">
                     <div>
                        <label className="block mb-1 font-medium">Role</label>
                        <input type="text" name="role" value={profile.leadership.role} onChange={(e) => handleNestedChange(e, 'leadership')} className="w-full p-2 border rounded" />
                    </div>
                     <div>
                        <label className="block mb-1 font-medium">Organization</label>
                        <input type="text" name="organization" value={profile.leadership.organization} onChange={(e) => handleNestedChange(e, 'leadership')} className="w-full p-2 border rounded" />
                    </div>
                     <div>
                        <label className="block mb-1 font-medium">Date</label>
                        <input type="text" name="date" value={profile.leadership.date} onChange={(e) => handleNestedChange(e, 'leadership')} className="w-full p-2 border rounded" />
                    </div>
                </div>
            </div>
        </div>

        <div className="flex items-center space-x-4">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              Save Profile
            </button>
            {message && <p className="text-green-600">{message}</p>}
        </div>
      </form>
    </div>
  );
}
