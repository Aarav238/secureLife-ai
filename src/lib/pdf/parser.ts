import { PDFParse } from "pdf-parse";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdf = new PDFParse(buffer);
  const result = await pdf.getText();
  return result.text;
}
