import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractRepairData } from "@/lib/ai-extractor";

/**
 * Test endpoint to verify Gemini API is working
 * GET /api/test/gemini
 */
export async function GET(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // Check if API key is set
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY is not set in environment variables",
        help: "Get your API key from: https://makersuite.google.com/app/apikey",
      });
    }

    console.log("Testing Gemini API...");

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Test 1: Basic API connectivity
    console.log("Test 1: Basic connectivity...");
    const simplePrompt = "Say 'Hello! API is working!' in exactly those words.";
    const simpleResult = await model.generateContent(simplePrompt);
    const simpleResponse = await simpleResult.response;
    const simpleText = simpleResponse.text();

    console.log("Simple response:", simpleText);

    // Test 2: Test extraction with a real example
    console.log("Test 2: Testing repair extraction...");

    const testTitle = "Lenovo Yoga Pro 7 no power, not charging - a neat repair!";
    const testDescription = "In this video, I repair a Lenovo Yoga Pro 7 laptop that has no power and is not charging. After troubleshooting the power circuit, I found a faulty MOSFET on the charging circuit. Replacing the component fixed the issue.";

    const extraction = await extractRepairData(testTitle, testDescription);

    console.log("Extraction result:", extraction);

    return NextResponse.json({
      success: true,
      message: "Gemini API is working correctly! ✅",
      tests: {
        "1_basic_connectivity": {
          status: "✅ Pass",
          response: simpleText.substring(0, 100),
        },
        "2_repair_extraction": {
          status: extraction.brand ? "✅ Pass" : "⚠️ Low quality",
          extracted: {
            brand: extraction.brand,
            model: extraction.model,
            problemType: extraction.problemType,
            confidence: extraction.confidence,
            hasTroubleshooting: !!extraction.troubleshooting,
            hasSolution: !!extraction.solution,
          },
          reasoning: extraction.reasoning,
        },
      },
      sampleExtraction: {
        input: {
          title: testTitle,
          description: testDescription,
        },
        output: extraction,
      },
    });
  } catch (error: any) {
    console.error("Gemini API test error:", error);

    // Check for common errors
    let errorMessage = error.message || "Unknown error";
    let help = "";

    if (errorMessage.includes("API_KEY_INVALID")) {
      help = "Your API key is invalid. Generate a new one at https://makersuite.google.com/app/apikey";
    } else if (errorMessage.includes("quota")) {
      help = "You've exceeded your API quota. Check your usage at https://makersuite.google.com/";
    } else if (errorMessage.includes("PERMISSION_DENIED")) {
      help = "Permission denied. Make sure the API key has access to Gemini API.";
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      help: help || "Check the console logs for more details",
      details: error.toString(),
    });
  }
}
