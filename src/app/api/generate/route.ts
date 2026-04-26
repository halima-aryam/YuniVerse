import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = 'edge';

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
            ],
            resource: {
              title: `Book: The Origins of ${topic}`,
              url: `https://www.amazon.com/s?k=${topic}+book`
            }
          },
          {
            id: (Date.now() + 1).toString(),
            title: `A Deep Dive (The ${vibe} Way)`,
            items: [
              `Find a cozy spot and listen to a podcast about ${topic}`,
              `Jot down 3 sentences about the most interesting thing you learned`,
              `Share a cool fact with a friend`
            ],
            resource: {
              title: `YouTube: Deep Dive into ${topic}`,
              url: `https://www.youtube.com/results?search_query=advanced+${topic}`
            }
          }
        ]
      });
    }

    // Use Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Create a self-directed learning curriculum about "${topic}".
The aesthetic vibe of the curriculum should be "${vibe}".
CRITICAL INSTRUCTIONS:
1. Be highly practical, specific, and actionable. Do not use fluffy or overly whimsical language. Focus on providing real, tangible learning steps.
2. Provide a list of 2-3 real, practical online resources in the 'resources' list.
3. CRITICAL: For EACH module, you MUST include a contextually relevant 'resource' object containing a 'title' and 'url'. Mix up the types (Books, YouTube, Articles, Documentaries).
4. CRITICAL: Do NOT hallucinate exact URLs as they often break. Instead, generate valid search URLs for the resources. For YouTube use \`https://www.youtube.com/results?search_query=[keywords]\`, for Wikipedia use \`https://en.wikipedia.org/w/index.php?search=[keywords]\`, and for Amazon use \`https://www.amazon.com/s?k=[book+title]\`.
5. Each module MUST contain at least one step that explicitly requires using its provided resource.
Return the response strictly as a JSON object with this exact structure:
{
  "resources": [
    { "title": "Name of the resource", "url": "https://example.com" }
  ],
  "modules": [
    {
      "title": "Module Name",
      "items": ["actionable short learning step 1", "actionable short learning step 2"],
      "resource": {
        "title": "YouTube: How to ...",
        "url": "https://www.youtube.com/results?search_query=..."
      }
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
    
    const applyAffiliate = (res: any) => {
        if (res && res.url && res.url.includes("amazon.com")) {
           try {
             const urlObj = new URL(res.url);
             urlObj.searchParams.set("tag", AFFILIATE_TAG);
             res.url = urlObj.toString();
           } catch(e) {}
        }
        return res;
    };

    if (data.resources && Array.isArray(data.resources)) {
      data.resources = data.resources.map(applyAffiliate);
    }
    
    if (data.modules && Array.isArray(data.modules)) {
      data.modules = data.modules.map((mod: any) => {
          if (mod.resource) {
              mod.resource = applyAffiliate(mod.resource);
          }
          return mod;
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Error:", error);
    let errorMessage = error.message || "An unknown error occurred.";
    
    // If it's a massive Google RPC error dump, make it user-friendly
    if (typeof errorMessage === 'string' && (errorMessage.includes("type.googleapis.com") || errorMessage.includes("details"))) {
       errorMessage = "The magical AI encountered a small hiccup (usually a safety filter or temporary overload). Please try rephrasing your topic!";
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
