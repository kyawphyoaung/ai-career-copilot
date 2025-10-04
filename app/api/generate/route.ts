// File: app/api/generate/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateCvContent } from '@/lib/gemini'; // Import the new Gemini service

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

    // 2. Call the REAL Gemini API with the JD and user profile
    const cvJson = await generateCvContent(jobDescription, userProfile);
    
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
    // Provide a more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

