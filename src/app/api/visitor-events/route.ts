import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for visitor events
const visitorEventSchema = z.object({
  eventName: z.string().min(1, 'Event name is required'),
  eventDateStart: z.string().pipe(z.coerce.date()),
  eventDateEnd: z.string().pipe(z.coerce.date()),
  eventStartTime: z.string().optional().nullable(),
  eventEndTime: z.string().optional().nullable(),
  eventStatus: z.enum(['CONFERENCE', 'SHOW', 'WORKSHOP', 'SEMINAR', 'EXHIBITION']),
  isActive: z.boolean().default(true),
  description: z.string().optional().nullable(),
});

// POST - Create new visitor event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = visitorEventSchema.parse(body);

    const visitorEvent = await prisma.visitorEvents.create({
      data: {
        eventName: validatedData.eventName,
        eventDateStart: validatedData.eventDateStart,
        eventDateEnd: validatedData.eventDateEnd,
        eventStartTime: validatedData.eventStartTime ? new Date(validatedData.eventStartTime) : null,
        eventEndTime: validatedData.eventEndTime ? new Date(validatedData.eventEndTime) : null,
        eventStatus: validatedData.eventStatus,
        isActive: validatedData.isActive,
        description: validatedData.description,
      }
    });

    return NextResponse.json({
      success: true,
      data: visitorEvent
    }, { status: 201 });

  } catch (error) {
    console.error('Visitor event creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Retrieve visitor events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let whereClause: any = {};

    if (active === 'true') {
      whereClause.isActive = true;
    } else if (active === 'false') {
      whereClause.isActive = false;
    }

    if (status) {
      whereClause.eventStatus = status;
    }

    const visitorEvents = await prisma.visitorEvents.findMany({
      where: whereClause,
      orderBy: {
        eventDateStart: 'asc'
      },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    });

    return NextResponse.json({
      success: true,
      data: visitorEvents,
      count: visitorEvents.length
    });

  } catch (error) {
    console.error('Error fetching visitor events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update visitor event
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Visitor event ID is required' },
        { status: 400 }
      );
    }

    // Validate update data with partial schema
    const partialSchema = visitorEventSchema.partial();
    const validatedData = partialSchema.parse(updateData);

    const updatedVisitorEvent = await prisma.visitorEvents.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: updatedVisitorEvent
    });

  } catch (error) {
    console.error('Error updating visitor event:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Remove visitor event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId parameter is required' },
        { status: 400 }
      );
    }

    await prisma.visitorEvents.delete({
      where: { id: eventId }
    });

    return NextResponse.json({
      success: true,
      message: 'Visitor event deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting visitor event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}