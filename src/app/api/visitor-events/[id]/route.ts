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

// GET - Retrieve single visitor event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    const visitorEvent = await prisma.visitorEvents.findUnique({
      where: { id: eventId }
    });

    if (!visitorEvent) {
      return NextResponse.json(
        { error: 'Visitor event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: visitorEvent
    });

  } catch (error) {
    console.error('Error fetching visitor event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update visitor event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await request.json();

    // Validate update data with partial schema
    const partialSchema = visitorEventSchema.partial();
    const validatedData = partialSchema.parse(body);

    const updatedVisitorEvent = await prisma.visitorEvents.update({
      where: { id: eventId },
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

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