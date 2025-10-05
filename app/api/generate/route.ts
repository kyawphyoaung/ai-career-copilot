import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    generateCvContentForUser,
    analyzeJobDescriptionAndSkills,
} from "@/lib/gemini";

// API Route ရဲ့ POST method ကို ခံယူခြင်း
export async function POST(request: Request) {
    console.log("--- [START] CV Generation Request Received ---");

    try {
        // 1. Request Body ကို ဖတ်ခြင်း (Parsing)
        let body;
        try {
            body = await request.json();
            console.log("1. Request Body Parsed Successfully. Data:");
            console.log(JSON.stringify(body, null, 2));
        } catch (parseError) {
            console.error("ERROR: Failed to parse request JSON.", parseError);
            return NextResponse.json(
                { error: "Invalid JSON format in request body" },
                { status: 400 }
            );
        }

        const { jobDescription, userProfileId, companyName, jobTitle, location, source } = body;
        const Int_userProfileId = parseInt(userProfileId);

        // 2. လိုအပ်သော Fields များ စစ်ဆေးခြင်း
        console.log(`2. Checking required fields: JD=${!!jobDescription}, UserID=${!!userProfileId}`);
        if (!jobDescription || !userProfileId) {
            console.error("ERROR: Missing required fields. jobDescription or userProfileId is missing.");
            return NextResponse.json(
                { error: "Job description and user profile ID are required" },
                { status: 400 }
            );
        }

        // 3. User Profile ကို Database မှ ခေါ်ယူခြင်း
        console.log(`3. Fetching UserProfile for ID: ${Int_userProfileId}`);
        const userProfile = await prisma.userProfile.findUnique({
            where: { id: Int_userProfileId },
            // masterSkills field ကို သေချာပြန်ရဖို့အတွက် select ထဲမှာ ထည့်စစ်တာ ပိုကောင်းပါတယ်
            select: {
                id: true,
                name: true,
                masterSkills: true, // ဤ field သည် null ဖြစ်နိုင်သည်ကို သတိပြုရန်
                // အခြားလိုအပ်သော fields များကိုလည်း ထပ်ထည့်နိုင်ပါသည်။
            }
        });

        if (!userProfile) {
            console.error(`ERROR: User Profile with ID ${userProfileId} not found in database.`);
            return NextResponse.json(
                { error: "User profile not found" },
                { status: 404 }
            );
        }

        // 2. MasterSkills data ကို ပြင်ဆင်ခြင်း
        let masterSkills = userProfile.masterSkills;

        // Log မှာပြခဲ့သလို MasterSkills ဟာ Array မဟုတ်ဘဲ Object ဖြစ်နေရင် စစ်ဆေးပါ။
        if (masterSkills && typeof masterSkills === 'object' && !Array.isArray(masterSkills)) {
            // Object ရဲ့ keys တွေကို ယူပြီး Array အဖြစ် ပြောင်းလိုက်ပါတယ်။
            // ဥပမာ- { "React": true, "Node.js": true } ကနေ ["React", "Node.js"] ဖြစ်သွားပါမယ်။
            masterSkills = Object.keys(masterSkills);

        } else if (!Array.isArray(masterSkills)) {
            // အကယ်၍ object လည်းမဟုတ်၊ array လည်းမဟုတ်၊ null/undefined ဖြစ်နေခဲ့ရင် empty array ပေးပါ။
            masterSkills = [];
        }


        // 5. Skill-Gap Analysis ကို Gemini ဖြင့် လုပ်ဆောင်ခြင်း
        console.log("5. Starting Skill-Gap Analysis with Gemini...");
        let analysisResult;
        try {
            // analyzeJobDescriptionAndSkills အတွက် masterSkills ကို string/array ဘယ်လို format နဲ့ ပေးရမလဲဆိုတာ စစ်ဆေးပါ။
            const skillsForAnalysis = masterSkills || "No user skills provided.";
            console.log(`Input to analyzeJobDescriptionAndSkills: User Master Skills=${skillsForAnalysis}, JD length=${jobDescription}`);

            analysisResult = await analyzeJobDescriptionAndSkills(
                skillsForAnalysis,
                jobDescription
            );
            console.log("6. Skill-Gap Analysis Completed Successfully. Result Keys:", Object.keys(analysisResult));
        } catch (aiError) {
            console.error("ERROR: analyzeJobDescriptionAndSkills (Gemini) failed.", aiError);
            // Gemini API ကိုယ်တိုင်က 400 (Invalid Argument) ပြန်လာရင် ဒီနေရာမှာ 500 ကို ပြန်ပို့နေတာဖြစ်နိုင်တယ်။
            return NextResponse.json(
                { error: "AI Skill Analysis failed. Check Gemini API inputs/key." },
                { status: 500 } // AI Service Error များကို 500 အဖြစ် ပြန်ပို့ပါ။
            );
        }


        // 7. CV Content ကို Gemini ဖြင့် Generate လုပ်ဆောင်ခြင်း
        console.log("7. Starting CV Content Generation with Gemini...");
        let generatedCvJson;
        try {
            generatedCvJson = await generateCvContentForUser(
                userProfile,
                jobDescription
            );
            console.log("8. CV Content Generation Completed Successfully.");
        } catch (aiError) {
            console.error("ERROR: generateCvContentForUser (Gemini) failed.", aiError);
            return NextResponse.json(
                { error: "AI CV Generation failed. Check Gemini API inputs/key/JSON schema." },
                { status: 500 }
            );
        }

        const applicationCountry = "Singapore";

        // 9. Application အသစ်ကို Database ထဲမှာ သိမ်းဆည်းခြင်း
        console.log("9. Saving new Application record to database...");
        const newApplication = await prisma.application.create({
            data: {
                userProfileId: userProfile.id,
                companyName: companyName || "Unknown Company",
                jobTitle: jobTitle || "Unknown Title",
                country: location || "Unknown Location",
                source: source || "AI Copilot",
                jobDescription,
                generatedCvJson,
                cvPdfFilename: `CV_${userProfile.name?.replace(/\s/g, "_")}_${Date.now()}.pdf`,
                cvThemeUsed: "Default",
                skillMatchPercentage: analysisResult.skillMatchPercentage,
                requiredSkills: analysisResult.requiredSkills,
                missingSkills: analysisResult.missingSkills,
            },
        });
        console.log(`10. Application Saved. New ID: ${newApplication.id}`);


        // 11. Success Response ကို ပြန်ပို့ခြင်း
        console.log("11. Request Finished Successfully.");
        return NextResponse.json({
            application: newApplication,
            analysis: analysisResult,
        });

    } catch (error) {
        // Catch-All Error Handling
        console.error("--- [CATCH-ALL ERROR] General Server Error during CV Generation ---");
        console.error("Full Error Object:", error);

        // 500 Internal Server Error ကို ပြန်ပို့ခြင်း
        return NextResponse.json(
            { error: "An unexpected internal server error occurred." },
            { status: 500 }
        );
    } finally {
        console.log("--- [END] CV Generation Request Finished ---");
    }
}
