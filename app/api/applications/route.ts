// File: app/api/applications/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      jobDescription,
      generatedCvJson,
      companyName,
      jobTitle,
      country,
      source,
      contactEmail,
      cvThemeUsed
    } = body;
    
    // --- Generate Unique PDF Filename ---
    const user = await prisma.userProfile.findFirst({ where: { id: 1 } });
    if (!user) throw new Error("User profile not found");
    
    const sanitizedJobTitle = jobTitle.replace(/[^a-zA-Z0-9]/g, '');
    const count = await prisma.application.count({
      where: { jobTitle: jobTitle }
    });
    const cvPdfFilename = `${user.name.replace(/ /g, '')}_${sanitizedJobTitle}_${count + 1}.pdf`;

    // --- Save to Database ---
    const newApplication = await prisma.application.create({
      data: {
        companyName,
        jobTitle,
        jobDescription,
        generatedCvJson,
        cvPdfFilename,
        cvThemeUsed,
        country,
        source,
        contactEmail: contactEmail || null,
        userProfileId: 1, // Hardcoded for single user
      }
    });

    return NextResponse.json(newApplication, { status: 201 });

  } catch (error) {
    console.error('Error saving application:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

