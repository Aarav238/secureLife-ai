import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AnalysisResult {
  summary: string;
  coverageGaps: Array<{
    area: string;
    description: string;
    severity: string;
  }>;
  potentialSavings: Array<{
    area: string;
    estimatedSaving: string;
    description: string;
  }>;
  riskFlags: Array<{ flag: string; severity: string; description: string }>;
  recommendations: Array<{
    action: string;
    priority: string;
    rationale: string;
  }>;
  overallScore: number;
}

const SYSTEM_PROMPT = `You are a senior insurance analyst at SecureLife Insurance Brokers. You are reviewing a prospective client's profile and their existing insurance documents.

Given the client profile and extracted document data below, provide a comprehensive analysis.

Provide your analysis as a JSON object ONLY:

{
  "summary": "2-3 paragraph overall assessment of the client's insurance situation",
  "coverageGaps": [
    { "area": "...", "description": "...", "severity": "low|medium|high|critical" }
  ],
  "potentialSavings": [
    { "area": "...", "estimatedSaving": "₹X,XXX/year", "description": "..." }
  ],
  "riskFlags": [
    { "flag": "...", "severity": "low|medium|high|critical", "description": "..." }
  ],
  "recommendations": [
    { "action": "...", "priority": "immediate|short-term|long-term", "rationale": "..." }
  ],
  "overallScore": 0-100
}

Be specific and actionable. Reference actual numbers from their documents. Consider Indian insurance market context. Do not be generic — tailor everything to THIS client.`;

export async function generateAnalysis(
  leadData: Record<string, unknown>,
  documentsData: Record<string, unknown>[]
): Promise<AnalysisResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    max_tokens: 4096,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `CLIENT PROFILE:\n${JSON.stringify(leadData, null, 2)}\n\nEXISTING DOCUMENTS:\n${JSON.stringify(documentsData, null, 2)}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content || "";
  const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr);
}
