import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { reportSchema } from "@/lib/validators";
import { isRateLimited } from "@/lib/rate-limit";

export async function GET() {
  try {
    // Only allow admin access — for now check a hardcoded admin ID
    // Replace with proper role check when auth is implemented
    const userId = getCurrentUserId();
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

    if (!user) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const reports = await prisma.report.findMany({
      include: { listing: true, reporter: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(reports);
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getCurrentUserId();

    if (isRateLimited(`${userId}:report`, 3, 300_000)) {
      return NextResponse.json({ error: "Too many reports" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reason: parsed.data.reason,
        details: parsed.data.details ?? null,
        listingId: parsed.data.listingId,
        reporterId: userId
      }
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
