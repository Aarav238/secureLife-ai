import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTextFromPDF } from "@/lib/pdf/parser";
import { extractDocumentData } from "@/lib/ai/extractor";
import type { DocumentType } from "@prisma/client";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({ where: { id } });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Update status to processing
    await prisma.document.update({
      where: { id },
      data: { processingStatus: "processing" },
    });

    // Download file from Supabase Storage (or any URL)
    const response = await fetch(document.fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const rawText = await extractTextFromPDF(buffer);

    if (!rawText || rawText.trim().length < 50) {
      await prisma.document.update({
        where: { id },
        data: {
          processingStatus: "failed",
          processingError:
            "Could not extract sufficient text. The PDF may be scanned/image-based.",
          rawText,
        },
      });
      return NextResponse.json(
        { error: "Insufficient text extracted from PDF" },
        { status: 422 }
      );
    }

    // Extract structured data via AI
    const extracted = await extractDocumentData(rawText);

    // Map document type
    const validTypes = [
      "HEALTH_INSURANCE",
      "LIFE_INSURANCE",
      "VEHICLE_INSURANCE",
      "HOME_INSURANCE",
      "TRAVEL_INSURANCE",
      "OTHER",
    ];
    const docType =
      extracted.documentType && validTypes.includes(extracted.documentType)
        ? (extracted.documentType as DocumentType)
        : null;

    const updated = await prisma.document.update({
      where: { id },
      data: {
        rawText,
        extractedData: JSON.parse(JSON.stringify(extracted)),
        documentType: docType,
        policyNumber: extracted.policyNumber,
        provider: extracted.provider,
        policyType: extracted.policyType,
        coverageAmount: extracted.coverageAmount,
        premiumAmount: extracted.premiumAmount,
        premiumFrequency: extracted.premiumFrequency,
        startDate: extracted.startDate ? new Date(extracted.startDate) : null,
        endDate: extracted.endDate ? new Date(extracted.endDate) : null,
        renewalDate: extracted.renewalDate
          ? new Date(extracted.renewalDate)
          : null,
        exclusions: extracted.exclusions ?? [],
        benefits: extracted.benefits ?? [],
        processingStatus: "completed",
        processingError: null,
      },
    });

    // Update lead status
    await prisma.lead.update({
      where: { id: document.leadId },
      data: { status: "DOCUMENTS_UPLOADED" },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Extraction error:", error);
    const { id } = await params;
    await prisma.document.update({
      where: { id },
      data: {
        processingStatus: "failed",
        processingError:
          error instanceof Error ? error.message : "Unknown error",
      },
    });
    return NextResponse.json(
      { error: "Failed to extract document data" },
      { status: 500 }
    );
  }
}
