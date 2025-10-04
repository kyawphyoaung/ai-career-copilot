// app/api/generate/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  generateCvContentForUser,
  analyzeJobDescriptionAndSkills, // Import function အသစ်
} from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { jobDescription, userProfileId, companyName, jobTitle, location, source } =
      await request.json();

    if (!jobDescription || !userProfileId) {
      return NextResponse.json(
        { error: "Job description and user profile ID are required" },
        { status: 400 }
      );
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userProfileId },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // --- Skill-Gap Analysis ကို အရင်လုပ်ဆောင်ပါ ---
    const analysisResult = await analyzeJobDescriptionAndSkills(
      userProfile.masterSkills,
      jobDescription
    );

    // --- CV Content ကို ဆက်လက် Generate လုပ်ပါ ---
    const generatedCvJson = await generateCvContentForUser(
      userProfile,
      jobDescription
    );
    
    // --- Application အသစ်ကို Database ထဲမှာ သိမ်းဆည်းပါ ---
    const newApplication = await prisma.application.create({
      data: {
        userProfileId: userProfile.id,
        companyName: companyName || "Unknown Company",
        jobTitle: jobTitle || "Unknown Title",
        location: location || "Unknown Location",
        source: source || "AI Copilot",
        jobDescription,
        generatedCvJson,
        cvPdfFilename: `CV_${userProfile.name.replace(" ", "_")}_${Date.now()}.pdf`,
        cvThemeUsed: "Default",
        // Analysis result များကို ထည့်သွင်းသိမ်းဆည်းခြင်း
        skillMatchPercentage: analysisResult.skillMatchPercentage,
        requiredSkills: analysisResult.requiredSkills,
        missingSkills: analysisResult.missingSkills,
      },
    });

    return NextResponse.json({
      application: newApplication,
      analysis: analysisResult, // Analysis result ကိုပါ Frontend သို့ ပြန်ပေးခြင်း
    });
  } catch (error) {
    console.error("Error generating CV:", error);
    return NextResponse.json(
      { error: "Failed to generate CV" },
      { status: 500 }
    );
  }
}
