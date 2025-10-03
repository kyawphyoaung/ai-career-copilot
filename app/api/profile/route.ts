import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Function to get the user profile
export async function GET() {
  try {
    // We assume there's only one user profile for this local app, so we find the first one.
    const userProfile = await prisma.userProfile.findFirst();
    if (!userProfile) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Function to create or update the user profile
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Use `upsert` to create a new profile if one doesn't exist, or update it if it does.
    // We use a fixed ID of 1 because this is a single-user local application.
    const userProfile = await prisma.userProfile.upsert({
      where: { id: 1 },
      update: data,
      create: {
        ...data,
      },
    });

    return NextResponse.json(userProfile, { status: 200 });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
