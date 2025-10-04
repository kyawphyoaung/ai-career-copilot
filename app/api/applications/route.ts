// app/api/applications/route.ts

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all applications
export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      where: { userProfileId: 1 }, // This should be dynamic based on the authenticated user
      orderBy: { appliedAt: "desc" },
    });
    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

// <<<<<<< POST to create a new application (Made more robust) >>>>>>>>>
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName, jobTitle, jobDescription, generatedCvJson,
      cvThemeUsed, cvPdfFilename, country, source, contactEmail,
      followUp, skillMatchPercentage, requiredSkills, missingSkills,
      userProfileId, followUpDate
    } = body;

    if (!companyName || !jobTitle || !userProfileId || !generatedCvJson) {
      return NextResponse.json({ error: "Missing required fields for application." }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        companyName,
        jobTitle,
        jobDescription,
        generatedCvJson,
        cvThemeUsed,
        cvPdfFilename,
        country,
        source,
        contactEmail,
        followUp,
        skillMatchPercentage,
        requiredSkills,
        missingSkills,
        userProfileId,
        followUpDate,
        // Ensure boolean defaults are handled if not provided
        followUpCompleted: false,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
