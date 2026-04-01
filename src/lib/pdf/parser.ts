import { extractText } from "unpdf";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
  return text;
}
