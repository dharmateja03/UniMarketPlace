import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { reportSchema } from "@/lib/validators";

export async function GET() {
  const reports = await prisma.report.findMany({
    include: { listing: true, reporter: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const userId = getCurrentUserId();
  const report = await prisma.report.create({
    data: {
      reason: parsed.data.reason,
      details: parsed.data.details ?? null,
      listingId: parsed.data.listingId,
      reporterId: userId
    }
  });

  return NextResponse.json(report, { status: 201 });
}
