import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAnalysis } from "@/lib/ai/analyzer";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { documents: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const leadData = {
      name: lead.name,
      age: lead.age,
      city: lead.city,
      occupation: lead.occupation,
      primaryInterest: lead.primaryInterest,
      monthlyBudget: lead.monthlyBudget,
      existingPolicies: lead.existingPolicies,
      urgency: lead.urgency,
    };

    const documentsData = lead.documents
      .filter((d) => d.processingStatus === "completed")
      .map((d) => ({
        documentType: d.documentType,
        provider: d.provider,
        policyType: d.policyType,
        coverageAmount: d.coverageAmount,
        premiumAmount: d.premiumAmount,
        premiumFrequency: d.premiumFrequency,
        startDate: d.startDate,
        endDate: d.endDate,
        exclusions: d.exclusions,
        benefits: d.benefits,
        extractedData: d.extractedData,
      }));

    const result = await generateAnalysis(
      leadData as Record<string, unknown>,
      documentsData as Record<string, unknown>[]
    );

    // Upsert analysis
    const analysis = await prisma.analysis.upsert({
      where: { leadId },
      create: {
        leadId,
        summary: result.summary,
        coverageGaps: result.coverageGaps,
        potentialSavings: result.potentialSavings,
        riskFlags: result.riskFlags,
        recommendations: result.recommendations,
        overallScore: result.overallScore,
        rawResponse: JSON.stringify(result),
      },
      update: {
        summary: result.summary,
        coverageGaps: result.coverageGaps,
        potentialSavings: result.potentialSavings,
        riskFlags: result.riskFlags,
        recommendations: result.recommendations,
        overallScore: result.overallScore,
        rawResponse: JSON.stringify(result),
      },
    });

    // Update lead status
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "ANALYSIS_READY" },
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    const analysis = await prisma.analysis.findUnique({ where: { leadId } });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}
