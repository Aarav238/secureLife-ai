import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/chat/history — list all chat sessions
export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      where: { source: "chatbot" },
      select: {
        id: true,
        name: true,
        primaryInterest: true,
        status: true,
        createdAt: true,
        conversations: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const sessions = leads.map((lead: typeof leads[number]) => ({
      leadId: lead.id,
      name: lead.name,
      primaryInterest: lead.primaryInterest,
      status: lead.status,
      createdAt: lead.createdAt,
      lastMessage: lead.conversations[0]?.content?.slice(0, 80) || null,
      lastMessageAt: lead.conversations[0]?.createdAt || lead.createdAt,
    }));

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Chat history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
