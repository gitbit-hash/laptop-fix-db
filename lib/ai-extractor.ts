import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ExtractedRepairData {
  brand?: string | null;
  model?: string | null;
  problemType?: string | null;
  troubleshooting?: string | null;
  solution?: string | null;
  confidence: "high" | "medium" | "low";
  reasoning?: string;
}

/**
 * Extract repair information from video data using AI
 */
export async function extractRepairData(
  title: string,
  description?: string,
  transcript?: string
): Promise<ExtractedRepairData> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert at analyzing laptop repair video data from the "Electronics Repair School" YouTube channel by Sorin.

Analyze this video information and extract structured repair data:

**Video Title:** ${title}

**Description:** ${description || "Not available"}

**Transcript:** ${transcript ? transcript.substring(0, 3000) + "..." : "Not available"}

Extract the following information in JSON format:
{
  "brand": "laptop brand (Dell, HP, Lenovo, MSI, Asus, Apple, etc.) or null if not found",
  "model": "specific laptop model (e.g., 'EliteBook 840 G5', 'ThinkPad X1 Carbon') or null if not found",
  "problemType": "main problem category: choose from ['No Power', 'Not Charging', 'No Display', 'No Boot', 'Liquid Damage', 'Short Circuit', 'Overheating', 'BIOS Issue', 'Other'] or null",
  "troubleshooting": "brief description of the troubleshooting steps Sorin took (2-3 sentences)",
  "solution": "brief description of how the issue was fixed (2-3 sentences)",
  "confidence": "high/medium/low - how confident you are in the extraction",
  "reasoning": "brief explanation of your confidence level"
}

Important guidelines:
- Extract only factual information from the provided data
- If information is not clear or not present, use null
- For problemType, standardize to one of the listed categories
- Keep troubleshooting and solution concise but informative
- If multiple problems exist, focus on the main one mentioned in the title

Return ONLY valid JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("AI Response:", text);

    // Parse JSON from response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }

    const extracted: ExtractedRepairData = JSON.parse(jsonMatch[0]);

    // Validate and clean the data
    return {
      brand: extracted.brand || null,
      model: extracted.model || null,
      problemType: extracted.problemType || null,
      troubleshooting: extracted.troubleshooting || null,
      solution: extracted.solution || null,
      confidence: extracted.confidence || "low",
      reasoning: extracted.reasoning || "No reasoning provided",
    };
  } catch (error) {
    console.error("Error extracting repair data:", error);

    // Return a low-confidence empty result instead of throwing
    return {
      brand: null,
      model: null,
      problemType: null,
      troubleshooting: null,
      solution: null,
      confidence: "low",
      reasoning: `Extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Helper to create or find Brand in database
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Standardize problem type names
 */
export function standardizeProblemType(problemType: string | null): string | null {
  if (!problemType) return null;

  const normalized = problemType.toLowerCase().trim();

  const problemMap: { [key: string]: string } = {
    "no power": "No Power",
    "not charging": "Not Charging",
    "no display": "No Display",
    "no boot": "No Boot",
    "liquid damage": "Liquid Damage",
    "water damage": "Liquid Damage",
    "short circuit": "Short Circuit",
    "short": "Short Circuit",
    "overheating": "Overheating",
    "bios issue": "BIOS Issue",
    "bios": "BIOS Issue",
  };

  return problemMap[normalized] || "Other";
}
