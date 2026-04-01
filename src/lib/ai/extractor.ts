import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EXTRACTION_PROMPT = `You are a document analysis AI specializing in insurance policies. You will be given the extracted text from an insurance document (PDF).

Analyze the document and extract ALL of the following fields. If a field is not found, set it to null. Do NOT hallucinate or guess values — only extract what is explicitly stated.

Return your response as a JSON object ONLY, no other text:

{
  "documentType": "HEALTH_INSURANCE|LIFE_INSURANCE|VEHICLE_INSURANCE|HOME_INSURANCE|TRAVEL_INSURANCE|OTHER",
  "policyNumber": "...",
  "provider": "...",
  "policyType": "...",
  "insuredName": "...",
  "coverageAmount": number_or_null,
  "premiumAmount": number_or_null,
  "premiumFrequency": "monthly|quarterly|yearly|null",
  "startDate": "YYYY-MM-DD or null",
  "endDate": "YYYY-MM-DD or null",
  "renewalDate": "YYYY-MM-DD or null",
  "exclusions": ["list of exclusions"],
  "benefits": ["list of benefits/coverages"],
  "deductible": number_or_null,
  "nominees": ["list of nominee names"],
  "additionalNotes": "any other important details"
}`;

export interface ExtractedDocumentData {
  documentType?: string;
  policyNumber?: string;
  provider?: string;
  policyType?: string;
  insuredName?: string;
  coverageAmount?: number;
  premiumAmount?: number;
  premiumFrequency?: string;
  startDate?: string;
  endDate?: string;
  renewalDate?: string;
  exclusions?: string[];
  benefits?: string[];
  deductible?: number;
  nominees?: string[];
  additionalNotes?: string;
}

export async function extractDocumentData(
  rawText: string
): Promise<ExtractedDocumentData> {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    max_tokens: 2048,
    messages: [
      { role: "system", content: EXTRACTION_PROMPT },
      {
        role: "user",
        content: `Here is the text extracted from an insurance document:\n\n---\n${rawText}\n---\n\nPlease extract the structured data as specified.`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content || "";

  try {
    const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(jsonStr);
  } catch {
    // Retry with stricter prompt
    const retryResponse = await openai.chat.completions.create({
      model: "gpt-4.1",
      max_tokens: 2048,
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        {
          role: "user",
          content: `Here is the text extracted from an insurance document:\n\n---\n${rawText}\n---\n\nReturn ONLY a valid JSON object with the extracted fields. No markdown, no explanation, just JSON.`,
        },
      ],
    });

    const retryText = retryResponse.choices[0]?.message?.content || "";
    const retryJsonStr = retryText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(retryJsonStr);
  }
}
