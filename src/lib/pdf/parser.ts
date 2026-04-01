// Polyfill DOMMatrix for serverless environments (Vercel) where
// pdfjs-dist expects browser globals that don't exist in Node.js.
if (typeof globalThis.DOMMatrix === "undefined") {
  // @ts-expect-error — minimal shim, pdfjs only needs the constructor
  globalThis.DOMMatrix = class DOMMatrix {
    constructor() {
      return Object.create(DOMMatrix.prototype);
    }
  };
}

import { PDFParse } from "pdf-parse";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdf = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await pdf.getText();
  return result.text;
}
