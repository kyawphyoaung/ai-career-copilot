// app/api/applications/[id]/route.ts

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET a single application by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const application = await prisma.application.findUnique({
      where: { id },
    });
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}

// <<<<<<< PATCH to update an application's status or follow-up state >>>>>>>>>
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { status, followUpCompleted } = body;

    if (status === undefined && followUpCompleted === undefined) {
      return NextResponse.json({ error: "No update data provided" }, { status: 400 });
    }
    
    const application = await prisma.application.update({
      where: { id },
      data: {
        ...(status && { status: status }),
        ...(followUpCompleted !== undefined && { followUpCompleted: followUpCompleted }),
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
