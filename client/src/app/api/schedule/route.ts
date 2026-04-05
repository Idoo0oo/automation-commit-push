import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repoOwner, repoName, commitMessage, scheduledTime, patToken, filesPayload } = body;

    // Validate inputs
    if (!repoOwner || !repoName || !commitMessage || !scheduledTime || !patToken || !filesPayload) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert into MySQL via Prisma
    const newSchedule = await prisma.scheduledCommit.create({
      data: {
        repoOwner,
        repoName,
        commitMessage,
        scheduledTime: new Date(scheduledTime),
        patToken,
        filesPayload,
        status: 'PENDING',
      }
    });

    return NextResponse.json({ success: true, id: newSchedule.id });
  } catch (error: any) {
    console.error("Schedule API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
