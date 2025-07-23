import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/adminSessions';

const prisma = new PrismaClient();

// Middleware to verify admin token
function verifyAdminToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization header');
  }

  const token = authHeader.split(' ')[1];
  const session = getSession(token);
  
  if (!session) {
    throw new Error('Invalid or expired token');
  }
  
  return session;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    const session = verifyAdminToken(authHeader);

    // Check if user is SUPERADMIN
    if (session.status !== 'SUPERADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Access denied. Only SUPERADMIN can delete visitors.',
      }, { status: 403 });
    }

    const visitorId = params.id;

    // Find the visitor first to get the user ID
    const visitor = await prisma.visitors.findUnique({
      where: { id: visitorId },
      select: { userId: true },
    });

    if (!visitor) {
      return NextResponse.json({
        success: false,
        message: 'Visitor not found',
      }, { status: 404 });
    }

    // Delete the visitor and related user data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete visitor record
      await tx.visitors.delete({
        where: { id: visitorId },
      });

      // If there's a user ID, delete related user data
      if (visitor.userId) {
        // Delete user details
        await tx.userDetails.deleteMany({
          where: { userId: visitor.userId },
        });

        // Delete user accounts
        await tx.userAccounts.deleteMany({
          where: { userId: visitor.userId },
        });

        // Delete the user
        await tx.user.delete({
          where: { id: visitor.userId },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Visitor deleted successfully',
    });

  } catch (error) {
    console.error('Admin visitor delete error:', error);

    if (error instanceof Error) {
      if (error.message.includes('token') || error.message.includes('authorization')) {
        return NextResponse.json({
          success: false,
          message: 'Unauthorized',
        }, { status: 401 });
      }
      
      if (error.message.includes('Access denied')) {
        return NextResponse.json({
          success: false,
          message: error.message,
        }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}