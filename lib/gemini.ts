// File: lib/gemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Added safety settings to reduce the chance of the API blocking a response
const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings});

export async function generateCvContent(jobDescription: string, userProfile: any): Promise<any> {
  const masterSkillsString = Object.entries(userProfile.masterSkills)
    .map(([skill, years]) => `${skill} (${years} years)`)
    .join(", ");

  // Providing more explicit work history context for the AI
  const workHistoryContext = `
    - Role: Software Engineer, Company: Singtel, Singapore
    - Role: Full-stack Developer & Academic Coordinator, Company: Shwe Maw Kun Education Group
  `;

  const prompt = `
    **Role:** You are an expert career coach and professional CV writer. Your task is to generate tailored CV content for a user applying for a specific job.

    **Objective:** Create a complete CV JSON object with "summary", "skills", and "experience" sections that are highly relevant to the provided Job Description, based on the user's Master Skill Set and profile.

    **Input Data:**

    1.  **Job Description (JD):**
        \`\`\`
        ${jobDescription}
        \`\`\`

    2.  **User Profile:**
        -   **Master Skill Set & Experience:** ${masterSkillsString}
        -   **Past Work History (for context):** ${workHistoryContext}

    **Instructions & Rules:**

    1.  **Analyze the JD:** Identify the top 5-7 most critical technical skills and soft skills required for the job.
    2.  **Generate "summary":** Write a powerful, concise professional summary (3-4 sentences) that directly addresses the JD's core requirements. Start with a strong title like "Results-driven Full-Stack Engineer" and incorporate the most important keywords from the JD. This section is mandatory.
    3.  **Generate "skills":**
        -   Create 3-4 skill categories (e.g., "Frontend & Web Technologies", "Backend & Databases", "Cloud & DevOps").
        -   From the user's Master Skill Set, select ONLY the skills that are most relevant to the JD and populate these categories.
        -   The output for each category's "items" must be a single comma-separated string (e.g., "React, Node.js, TypeScript"). This section is mandatory.
    4.  **Generate "experience":**
        -   For each of the user's past roles ("Software Engineer at Singtel", "Full-stack Developer at Shwe Maw Kun"), generate 2-3 achievement-oriented bullet points.
        -   Each bullet point MUST directly map to a responsibility or requirement in the JD. Use metrics where possible (e.g., "improved performance by 15%", "reduced bugs by 40%").
        -   **This section is mandatory.** Based on the JD and user skills, create relevant example achievements. For instance, if the JD asks for "CI/CD experience", a good bullet point would be: "Spearheaded the implementation of a new CI/CD pipeline at Singtel, reducing deployment time by 30%."
    5.  **Output Format:** You MUST return ONLY a valid JSON object. Do not include any explanatory text, markdown formatting (like \`\`\`json), or anything outside of the JSON structure. The JSON object must have the following structure:
        \`\`\`json
        {
          "summary": "string",
          "skills": [
            { "category": "string", "items": "string" }
          ],
          "experience": [
            { "title": "string", "company": "string", "date": "string", "points": ["string", "string"] }
          ]
        }
        \`\`\`

    Now, generate the complete JSON content based on the provided data.
  `;

  let text = '';
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    text = response.text();
    // Clean the output to ensure it's a valid JSON string
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error calling or parsing Gemini API:", error);
    console.error("--- Raw AI Response that caused error ---");
    console.error(text); // Log the raw text for debugging
    console.error("--------------------------------------");
    throw new Error("Failed to generate content from AI. The response was not valid JSON. Please check the server console for details.");
  }
}

