import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { topic, vibe } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Mock response if no API key is set
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Returning mocked data.");
      // simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json({
        modules: [
          {
            id: Date.now().toString(),
            title: `The Foundations of ${topic}`,
            items: [
              `Read a 5-minute introductory article on ${topic}`,
              `Watch a beginner's video on YouTube`,
              `Take a quiet moment to reflect on why you chose this topic`
            ]
          },
          {
            id: (Date.now() + 1).toString(),
            title: `A Deep Dive (The ${vibe} Way)`,
            items: [
              `Find a cozy spot and listen to a podcast about ${topic}`,
              `Jot down 3 sentences about the most interesting thing you learned`,
              `Share a cool fact with a friend`
            ]
          }
        ]
      });
    }

    // Use Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Create a self-directed learning curriculum about "${topic}".
The aesthetic vibe of the curriculum should be "${vibe}".
CRITICAL INSTRUCTIONS:
1. Be highly practical, specific, and actionable. Do not use fluffy or overly whimsical language (no "brew a cup of tea" or "take a quiet moment"). Focus on providing real, tangible learning steps.
2. Provide a list of 2-3 real, practical online resources. You MUST recommend at least one high-quality, real-world book or physical tool available on Amazon in the 'resources' list. Provide a valid Amazon URL for it.
Return the response strictly as a JSON object with this exact structure:
{
  "resources": [
    { "title": "Name of the resource", "url": "https://example.com" }
  ],
  "modules": [
    {
      "title": "Module Name",
      "items": ["actionable short learning step 1", "actionable short learning step 2"]
    }
  ]
}
Return ONLY valid JSON. Do not include markdown code block syntax.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    // Add IDs to the generated modules
    if (data.modules && Array.isArray(data.modules)) {
        data.modules = data.modules.map((m: any, i: number) => ({
            ...m,
            id: Date.now().toString() + i
        }));
    }

    // Affiliate Link Interceptor
    const AFFILIATE_TAG = "your-affiliate-tag-20"; // Replace with real tag later
    if (data.resources && Array.isArray(data.resources)) {
      data.resources = data.resources.map((res: any) => {
        if (res.url && res.url.includes("amazon.com")) {
           try {
             const urlObj = new URL(res.url);
             urlObj.searchParams.set("tag", AFFILIATE_TAG);
             res.url = urlObj.toString();
           } catch(e) {
             // Ignore invalid URL parsing errors
           }
        }
        return res;
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
