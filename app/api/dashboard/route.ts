// app/api/dashboard/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

export async function GET(request: Request) {
  // In a real app, you'd get the user ID from the session/auth token
  const userId = 1; // Hardcoding user ID 1 for now

  try {
    const applications = await prisma.application.findMany({
      where: { userProfileId: userId },
      orderBy: {
        appliedAt: "desc",
      },
    });

    const totalApplications = applications.length;

    const statusCounts = {
      APPLIED: 0,
      INTERVIEWING: 0,
      OFFER: 0,
      REJECTED: 0,
    };

    applications.forEach((app) => {
      if (app.status in statusCounts) {
        statusCounts[app.status as ApplicationStatus]++;
      }
    });

    const analytics = {
      totalApplications,
      statusCounts,
      // You can add more complex analytics here later
      // e.g., successRate, averageTimeToResponse, etc.
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
