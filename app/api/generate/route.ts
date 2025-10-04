import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This is a placeholder for the actual Gemini API call.
// We will replace this with a real API call in the future.
async function callGeminiApi(jobDescription: string, userProfile: any) {
  
  // For now, we'll return a sample JSON based on the user's profile
  // to simulate the AI's response.
  
  const tailoredSummary = `Results-driven Full Stack Developer with over 3 years of experience, specializing in technologies like ${Object.keys(userProfile.masterSkills).slice(0, 2).join(' and ')}. Eager to apply my skills in a dynamic environment as described in the job posting.`;

  const tailoredSkills = Object.entries(userProfile.masterSkills)
    .slice(0, 8) // Take first 8 skills for the example
    .reduce((acc, [skill, _], i) => {
        const categoryIndex = Math.floor(i / 2);
        if (!acc[categoryIndex]) {
            acc[categoryIndex] = { category: `Key Area ${categoryIndex + 1}`, items: [] };
        }
        (acc[categoryIndex].items as string[]).push(skill);
        return acc;
    }, [] as { category: string; items: string[] }[])
    .map(group => ({...group, items: group.items.join(', ')}));


  return {
    summary: tailoredSummary,
    skills: tailoredSkills,
    experience: [
        {
            title: "Senior Software Engineer (Example)",
            company: "Tech Company Inc.",
            date: "Jan 2022 - Present",
            points: [
                "This is a placeholder experience tailored by the AI.",
                "Developed scalable features based on the job description requirements."
            ]
        }
    ]
  };
}

export async function POST(request: Request) {
  try {
    const { jobDescription } = await request.json();

    if (!jobDescription) {
      return NextResponse.json({ message: 'Job Description is required' }, { status: 400 });
    }

    // 1. Fetch the user's profile from the database
    const userProfile = await prisma.userProfile.findFirst({
      where: { id: 1 }, // Assuming a single user with id 1
    });

    if (!userProfile) {
      return NextResponse.json({ message: 'User profile not found. Please create it first.' }, { status: 404 });
    }

    // 2. Call the Gemini API with the JD and user profile
    const cvJson = await callGeminiApi(jobDescription, userProfile);
    
    // 3. Combine with static user data to create the full CV JSON
    const fullCvData = {
        name: userProfile.name,
        contact: {
            phone: userProfile.phone,
            email: userProfile.email,
            linkedin: userProfile.linkedinUrl,
            github: userProfile.githubUrl,
        },
        ...cvJson, // Add the AI-generated parts
        education: userProfile.education,
        leadership: userProfile.leadership,
    };


    return NextResponse.json(fullCvData);

  } catch (error) {
    console.error('Error generating CV:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
