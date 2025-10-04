// lib/gemini.ts

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.GEMINI_API_KEY!;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  // ... other safety settings
];

export async function generateCvContentForUser(
  userProfile: any,
  jobDescription: string
) {
  const prompt = `
    Based on the following user profile and job description, generate a tailored CV in JSON format.
    User Profile: ${JSON.stringify(userProfile)}
    Job Description: ${jobDescription}
    The JSON output should follow this structure: { "contact": { "name": "...", "email": "...", "phone": "...", "linkedin": "...", "github": "...", "website": "..." }, "summary": "...", "experience": [{ "jobTitle": "...", "company": "...", "duration": "...", "responsibilities": ["...", "..."] }], "education": [{ "degree": "...", "institution": "...", "duration": "..." }], "skills": ["...", "..."] }
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  return JSON.parse(text);
}

// <<<<<<< အသစ်ထပ်တိုးထားသော Function >>>>>>>>>
/**
 * Analyzes the job description against the user's skills to find gaps.
 * @param masterSkills The user's list of master skills.
 * @param jobDescription The job description text.
 * @returns An object containing required skills, missing skills, and match percentage.
 */
export async function analyzeJobDescriptionAndSkills(
  masterSkills: string[],
  jobDescription: string
): Promise<{
  requiredSkills: string[];
  missingSkills: string[];
  skillMatchPercentage: number;
}> {
  const prompt = `
    Analyze the following job description and compare it against the user's master skills.
    
    User's Master Skills: ${JSON.stringify(masterSkills)}
    
    Job Description: "${jobDescription}"

    Your task is to:
    1.  Identify and extract the key technical skills, tools, and programming languages required by the job description.
    2.  Compare this list of required skills with the user's master skills.
    3.  Identify which of the required skills the user is missing.
    4.  Calculate a skill match percentage. The formula should be: (Number of Matching Skills / Total Number of Required Skills) * 100.
    
    Provide the output ONLY in a valid JSON format, with no other text before or after the JSON block.
    The JSON object must have these exact keys: "requiredSkills", "missingSkills", "skillMatchPercentage".
    
    Example output:
    {
      "requiredSkills": ["React", "Node.js", "PostgreSQL", "AWS", "TypeScript"],
      "missingSkills": ["AWS", "PostgreSQL"],
      "skillMatchPercentage": 60
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    // Clean the text to ensure it's a valid JSON string
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedResult = JSON.parse(cleanedText);
    
    // Ensure the percentage is a number
    parsedResult.skillMatchPercentage = Number(parsedResult.skillMatchPercentage) || 0;

    return parsedResult;
  } catch (error) {
    console.error("Error analyzing job description with Gemini:", error);
    // Return a default empty state in case of an error
    return {
      requiredSkills: [],
      missingSkills: [],
      skillMatchPercentage: 0,
    };
  }
}
