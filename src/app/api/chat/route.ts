import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getChatResponse } from "@/lib/ai/chatbot";
import type { LeadState } from "@/lib/ai/chatbot";
import type { ExtractedLeadData } from "@/types";
import type { LeadStatus } from "@prisma/client";

function hasSubstantiveData(data: Record<string, unknown> | null): boolean {
  if (!data) return false;
  return !!(data.name || data.primaryInterest || data.email || data.phone);
}

export async function POST(req: NextRequest) {
  try {
    const { leadId, message, pendingHistory } = await req.json();

    // ── Existing lead: normal flow ──
    if (leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { conversations: { orderBy: { createdAt: "asc" } } },
      });
      if (!lead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }

      const conversationHistory = lead.conversations.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      const leadState: LeadState = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        age: lead.age,
        city: lead.city,
        occupation: lead.occupation,
        primaryInterest: lead.primaryInterest,
        existingPolicies: lead.existingPolicies,
        monthlyBudget: lead.monthlyBudget,
        urgency: lead.urgency,
      };

      const { reply, extractedData } = await getChatResponse(
        conversationHistory,
        message,
        leadState
      );

      await prisma.message.createMany({
        data: [
          { leadId: lead.id, role: "user", content: message },
          {
            leadId: lead.id,
            role: "assistant",
            content: reply,
            metadata: extractedData
              ? JSON.parse(JSON.stringify(extractedData))
              : undefined,
          },
        ],
      });

      if (extractedData) {
        const updateData = buildUpdateData(extractedData);
        if (Object.keys(updateData).length > 0) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: updateData,
          });
        }
      }

      return NextResponse.json({
        leadId: lead.id,
        message: reply,
        extractedData,
      });
    }

    // ── No lead yet: stateless — frontend sends pending history ──
    const history: Array<{ role: "user" | "assistant"; content: string }> =
      Array.isArray(pendingHistory) ? pendingHistory : [];

    const { reply, extractedData } = await getChatResponse(history, message);

    const updatedHistory = [
      ...history,
      { role: "user" as const, content: message },
      { role: "assistant" as const, content: reply },
    ];

    if (hasSubstantiveData(extractedData as Record<string, unknown> | null)) {
      const updateData = buildUpdateData(extractedData!);

      const lead = await prisma.lead.create({
        data: {
          source: "chatbot",
          status: (updateData.status as LeadStatus) || "QUALIFYING",
          ...updateData,
        },
      });

      await prisma.message.createMany({
        data: updatedHistory.map((msg) => ({
          leadId: lead.id,
          role: msg.role,
          content: msg.content,
        })),
      });

      return NextResponse.json({
        leadId: lead.id,
        message: reply,
        extractedData,
        pendingHistory: null,
      });
    }

    return NextResponse.json({
      leadId: null,
      message: reply,
      extractedData,
      pendingHistory: updatedHistory,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

function toNumber(val: unknown): number | null {
  if (val == null) return null;
  if (typeof val === "number") return isNaN(val) ? null : val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[₹$,\s]/g, "").replace(/\/(month|year|yr|mo).*$/i, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

function toInt(val: unknown): number | null {
  const num = toNumber(val);
  return num != null ? Math.round(num) : null;
}

function buildUpdateData(
  extractedData: ExtractedLeadData
): Record<string, unknown> {
  const updateData: Record<string, unknown> = {};
  if (extractedData.name) updateData.name = String(extractedData.name);
  if (extractedData.email) updateData.email = String(extractedData.email);
  if (extractedData.phone) updateData.phone = String(extractedData.phone);
  const age = toInt(extractedData.age);
  if (age != null) updateData.age = age;
  if (extractedData.city) updateData.city = String(extractedData.city);
  if (extractedData.occupation)
    updateData.occupation = String(extractedData.occupation);
  if (extractedData.primaryInterest)
    updateData.primaryInterest = String(extractedData.primaryInterest);
  const existingPolicies = toInt(extractedData.existingPolicies);
  if (existingPolicies != null) updateData.existingPolicies = existingPolicies;
  const monthlyBudget = toNumber(extractedData.monthlyBudget);
  if (monthlyBudget != null) updateData.monthlyBudget = monthlyBudget;
  if (extractedData.urgency) updateData.urgency = String(extractedData.urgency);
  const score = toInt(extractedData.qualificationScore);
  if (score != null) updateData.qualificationScore = score;
  if (extractedData.statusUpdate)
    updateData.status = extractedData.statusUpdate as LeadStatus;
  return updateData;
}
