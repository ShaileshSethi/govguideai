import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';

// Simple in-memory cache for queries to improve performance and reduce API calls
const queryCache = new Map<string, any>();

export async function POST(request: Request) {
  try {
    const { query, language } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const queryLower = query.toLowerCase().trim();

    // Check Cache First
    if (queryCache.has(queryLower)) {
      return NextResponse.json(queryCache.get(queryLower));
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Returning mock data for demo purposes.");
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Feature 10: Mock Error Handling / Follow-up
      if (queryLower.includes("certificate") && !queryLower.includes("birth") && !queryLower.includes("death") && !queryLower.includes("marriage")) {
        return NextResponse.json({
          isClarificationNeeded: true,
          clarificationMessage: "Do you need a Birth, Death, Marriage, Income, Caste, or Domicile certificate? Please specify."
        });
      }

      // Dynamic Mock Fallback based on category/query
      // Let's try to find a matching service in the JSON database
      let services = [];
      try {
        const dataPath = path.join(process.cwd(), 'data');
        const files = await fs.readdir(dataPath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const fileContent = await fs.readFile(path.join(dataPath, file), 'utf-8');
            services.push(JSON.parse(fileContent));
          }
        }
      } catch (err) {
        console.warn("Could not read data directory for mock data fallback.");
      }

      let matchedService = services.find((s: any) => queryLower.includes(s.id)) || services[0];
      
      if (queryLower.includes("passport") || queryLower.includes("travel")) {
        matchedService = services.find((s: any) => s.id === "passport");
      } else if (queryLower.includes("drive") || queryLower.includes("licence") || queryLower.includes("vehicle")) {
        matchedService = services.find((s: any) => s.id === "driving_licence");
      }

      // If we couldn't load the JSON, provide a hardcoded fallback
      if (!matchedService) {
        matchedService = {
          name: "Aadhaar Card Replacement",
          application_fee: "Nominal fee",
          estimated_processing_time: "7-15 days",
          official_apply_link: "https://india.gov.in",
          required_documents: [{ name: "ID Proof", purpose: "Verification", where_to_get: "Govt", issuing_authority: "Govt", official_link: "https://india.gov.in" }],
          application_steps: ["Visit portal", "Apply"]
        };
      }

      return NextResponse.json({
        isClarificationNeeded: false,
        summary: `Based on your request, we have identified the necessary steps. Since this is running in Demo Mode, here is a sample action plan for ${matchedService.name}.`,
        services: [
          {
            name: matchedService.name,
            description: matchedService.description || "Official Government Service",
            required_documents: matchedService.required_documents,
            application_steps: matchedService.application_steps,
            processing_time: matchedService.estimated_processing_time,
            application_fee: matchedService.application_fee,
            official_apply_link: matchedService.official_apply_link,
            official_information_link: matchedService.official_information_link || matchedService.official_apply_link
          }
        ],
        next_steps: [
          "Gather all the required documents listed above.",
          "Visit the official application portal to begin the process."
        ],
        tips: [
          "Ensure your mobile number is active for OTP verification.",
          "Keep scanned copies of your documents ready before starting the application."
        ]
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 1. Read System Prompt
    const systemPromptPath = path.join(process.cwd(), 'SYSTEM.MD');
    let systemPrompt = '';
    try {
      systemPrompt = await fs.readFile(systemPromptPath, 'utf-8');
    } catch (error) {
      console.warn("Could not read SYSTEM.MD, using default.");
    }

    // 2. Read Structured JSON Knowledge Base
    const dataPath = path.join(process.cwd(), 'data');
    let knowledgeContext = '';
    try {
      const files = await fs.readdir(dataPath);
      const servicesArray = [];
      for (const file of files) {
        if (file.endsWith('.json')) {
          const fileContent = await fs.readFile(path.join(dataPath, file), 'utf-8');
          servicesArray.push(JSON.parse(fileContent));
        }
      }
      knowledgeContext = JSON.stringify(servicesArray, null, 2);
    } catch (error) {
      console.warn("Could not read /data directory database.");
    }

    // 3. Construct Prompt
    const finalPrompt = `
SYSTEM PROMPT:
${systemPrompt}

STRUCTURED JSON KNOWLEDGE BASE (Use these services as your primary source of truth):
\`\`\`json
${knowledgeContext}
\`\`\`

USER QUERY:
${query}

INSTRUCTIONS:
1. You MUST return a valid JSON object matching this schema exactly. Do NOT wrap the JSON in markdown blocks like \`\`\`json. Just return the raw JSON object.
2. If the user's query is too vague and you cannot confidently identify the exact government service they need, you MUST ask a follow-up question. Never guess.
   Additionally, if the user asks about a topic completely unrelated to Indian government services (e.g. baking a cake), you MUST ask a follow-up question.
   In these cases, set "isClarificationNeeded" to true, and provide the question/response in "clarificationMessage". Leave the other fields empty or null.
3. Observe the "Language Request" in the USER QUERY. If the language request is "Hindi", you MUST translate all string values in your JSON response (summary, description, steps, tips, etc.) into Hindi. The JSON keys MUST remain in English.

{
  "isClarificationNeeded": boolean,
  "clarificationMessage": "string (optional, provide if clarification needed)",
  "summary": "string (Brief explanation of the user's situation and what needs to be done)",
  "services": [
    {
      "name": "string (Exact name of the service)",
      "description": "string (Why this service is needed for the user)",
      "required_documents": [
        {
          "name": "string",
          "mandatory": boolean,
          "purpose": "string",
          "where_to_get": "string",
          "issuing_authority": "string",
          "official_link": "string"
        }
      ],
      "application_steps": [
        "string"
      ],
      "processing_time": "string",
      "application_fee": "string",
      "official_apply_link": "string",
      "official_information_link": "string"
    }
  ],
  "next_steps": [
    "string (General next steps after completing the applications)"
  ],
  "tips": [
    "string (Helpful tips or common mistakes to avoid)"
  ]
}
`;

    // 4. Call Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    
    // Attempt to parse JSON
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(text);
    } catch (e) {
      // Attempt to clean up if it still returns markdown wrapper
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      jsonResponse = JSON.parse(cleanText);
    }

    // Save to Cache before returning
    queryCache.set(queryLower, jsonResponse);

    return NextResponse.json(jsonResponse);

  } catch (error: unknown) {
    console.error('API Error:', error);
    // Never return technical errors to the user as per 08_BACKEND_API.md
    return NextResponse.json({ 
      isClarificationNeeded: true,
      clarificationMessage: "We experienced a temporary issue processing your request. Could you please try again in a moment?" 
    }, { status: 200 }); // Return 200 so the frontend parses it as a successful clarification state
  }
}
