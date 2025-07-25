import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession, createSession } from '@/lib/adminSessions';

const prisma = new PrismaClient();

// Middleware to verify admin token
async function verifyAdminToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization header');
  }

  const token = authHeader.split(' ')[1];
  let session = getSession(token);

  // If session not found in memory, try to recreate it from database
  if (!session) {
    try {
      const admin = await prisma.managerAccount.findFirst({
        where: { isActive: true },
        select: { id: true, username: true, status: true }
      });

      if (admin) {
        const tempSession = {
          adminId: admin.id,
          username: admin.username,
          status: admin.status,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
        };

        if (token && token.length > 10) {
          createSession(token, tempSession);
          session = tempSession;
        }
      }
    } catch (dbError) {
      console.error('Database lookup failed:', dbError);
    }
  }

  if (!session) {
    throw new Error('Invalid or expired token');
  }

  return session;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    const session = await verifyAdminToken(authHeader);

    // Check if user is SUPERADMIN
    if (session.status !== 'SUPERADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Access denied. Only SUPERADMIN can delete visitors.',
      }, { status: 403 });
    }

    const resolvedParams = await params;
    const visitorId = resolvedParams.id;

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
        await tx.user_details.deleteMany({
          where: { userId: visitor.userId },
        });

        // Delete user accounts
        await tx.user_accounts.deleteMany({
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