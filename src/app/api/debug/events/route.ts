import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Debug endpoint to check events in database
export async function GET(request: NextRequest) {
  try {
    // Get all events
    const allEvents = await prisma.events.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get only active events
    const activeEvents = await prisma.events.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalEvents: allEvents.length,
        activeEvents: activeEvents.length,
        allEvents: allEvents,
        activeEventsOnly: activeEvents
      }
    });

  } catch (error) {
    console.error('Debug events error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch events',
        details: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}