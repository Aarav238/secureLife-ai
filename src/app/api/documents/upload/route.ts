import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const leadId = formData.get("leadId") as string;

    if (!file || !leadId) {
      return NextResponse.json(
        { error: "File and leadId are required" },
        { status: 400 }
      );
    }

    // Save file locally for MVP
    const uploadsDir = join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    const document = await prisma.document.create({
      data: {
        leadId,
        fileName: file.name,
        fileUrl: `/uploads/${fileName}`,
        fileSize: file.size,
        mimeType: file.type,
        processingStatus: "pending",
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
