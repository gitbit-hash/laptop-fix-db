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

    const hasTranscript = !!transcript && transcript.length > 100;

    const prompt = `You are an expert at analyzing laptop repair video data from the "Electronics Repair School" YouTube channel by Sorin.

Analyze this video information and extract structured repair data:

**Video Title:** ${title}

**Description:** ${description || "Not available"}

**Transcript:** ${hasTranscript ? transcript!.substring(0, 15000) + (transcript!.length > 15000 ? "..." : "") : "Not available"}

Extract the following information in JSON format:
{
  "brand": "laptop brand (Dell, HP, Lenovo, MSI, Asus, Apple, etc.) or null if not found",
  "model": "specific laptop model (e.g., 'EliteBook 840 G5', 'ThinkPad X1 Carbon') or null if not found",
  "problemType": "main problem category: choose from ['No Power', 'Not Charging', 'No Display', 'No Boot', 'Liquid Damage', 'Short Circuit', 'Overheating', 'BIOS Issue', 'Other'] or null",
  "troubleshooting": "REQUIRED - troubleshooting process description",
  "solution": "REQUIRED - solution description",
  "confidence": "high/medium/low - how confident you are in the extraction",
  "reasoning": "brief explanation of your confidence level"
}

${hasTranscript ? `
**TRANSCRIPT AVAILABLE - Detailed Extraction Mode:**
- For troubleshooting: Extract detailed step-by-step troubleshooting process that Sorin followed. Include: initial observations, measurements taken (voltages, resistances), components checked, diagnostic techniques used. Format as numbered steps if clear from transcript. Aim for 4-6 sentences with technical details.
- For solution: Extract comprehensive description of the fix applied. Include: faulty component identified, replacement/repair performed, technical details (part numbers, voltage values if mentioned), verification steps. Aim for 3-5 sentences with specific technical information.
` : `
**NO TRANSCRIPT - Inference Mode:**
Since no transcript is available, you MUST still provide troubleshooting and solution fields by:
1. Analyzing the video title carefully - it usually contains the brand, model, and problem type
2. Using the description if available
3. Based on your knowledge of common laptop repair procedures for the identified problem, provide:
   - For troubleshooting: A general step-by-step approach that Sorin would likely follow for this type of repair (e.g., "1. Visual inspection for damage. 2. Check power delivery with multimeter. 3. Test charging circuit components...")
   - For solution: The most common fix for this type of problem based on the title (e.g., "The issue was likely caused by a faulty charging IC/MOSFET. Component was replaced and functionality restored.")
4. Start your troubleshooting/solution with "[Inferred]" to indicate it's based on title analysis rather than transcript.
`}

Important guidelines:
- NEVER return null for troubleshooting or solution - always provide something useful
- ${hasTranscript ? "PRIORITIZE the transcript content - it contains the most detailed technical information" : "Base your inference on common repair patterns for the problem type identified in the title"}
- Extract specific technical details when available: voltages, component names, part numbers, measurement values
- For troubleshooting: focus on the diagnostic process, what was checked and how
- For solution: focus on what was actually done to fix the problem, not just the diagnosis
- Use step-by-step format when appropriate
- For problemType, standardize to one of the listed categories
- If multiple problems exist, focus on the main one mentioned in the title
- Be detailed but stay factual

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

    // Validate and clean the data - ensure troubleshooting and solution are never null
    return {
      brand: extracted.brand || null,
      model: extracted.model || null,
      problemType: extracted.problemType || null,
      troubleshooting: extracted.troubleshooting || "[Inferred] Based on the video title, standard troubleshooting for this type of repair includes visual inspection, multimeter testing of power circuits, and component-level diagnosis.",
      solution: extracted.solution || "[Inferred] Based on the problem type, the repair likely involved identifying and replacing the faulty component, followed by verification testing.",
      confidence: extracted.confidence || "low",
      reasoning: extracted.reasoning || "No reasoning provided",
    };
  } catch (error) {
    console.error("Error extracting repair data:", error);

    // Return a low-confidence result with fallback content instead of throwing
    return {
      brand: null,
      model: null,
      problemType: null,
      troubleshooting: "[Error] Unable to extract troubleshooting steps. Please review the video manually.",
      solution: "[Error] Unable to extract solution. Please review the video manually.",
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
