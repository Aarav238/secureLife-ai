import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        conversations: { orderBy: { createdAt: "desc" }, take: 1 },
        documents: { select: { id: true, fileName: true, processingStatus: true } },
        analysis: { select: { id: true, overallScore: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Leads fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
