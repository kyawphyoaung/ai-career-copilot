// app/api/follow-ups/pending/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // A follow-up is pending if:
    // 1. followUp flag is true
    // 2. followUpCompleted is false
    // 3. followUpDate is in the past or today
    const count = await prisma.application.count({
      where: {
        followUp: true,
        followUpCompleted: false,
        followUpDate: {
          lte: new Date(), // lte means less than or equal to (i.e., due now or in the past)
        },
        userProfileId: 1, // This should be dynamic based on the authenticated user
      },
    });
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching pending follow-up count:", error);
    return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 });
  }
}
