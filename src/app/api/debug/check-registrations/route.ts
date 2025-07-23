import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Debug endpoint to check recent registrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // Get recent conference registrations
    const conferences = await prisma.conference.findMany({
      where: email ? {
        user: {
          UserAccounts: {
            some: {
              email: email
            }
          }
        }
      } : {},
      include: {
        user: {
          include: {
            UserAccounts: true,
            UserDetails: true
          }
        },
        ConferencePayment: true,
        summaryOfPayments: {
          include: {
            event: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Get recent payments
    const payments = await prisma.conferencePayment.findMany({
      include: {
        conference: {
          include: {
            user: {
              include: {
                UserAccounts: true,
                UserDetails: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Get recent users
    const users = await prisma.user.findMany({
      where: email ? {
        UserAccounts: {
          some: {
            email: email
          }
        }
      } : {},
      include: {
        UserAccounts: true,
        UserDetails: true,
        Conferences: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    return NextResponse.json({
      success: true,
      data: {
        conferences: {
          count: conferences.length,
          data: conferences
        },
        payments: {
          count: payments.length,
          data: payments
        },
        users: {
          count: users.length,
          data: users
        }
      }
    });

  } catch (error) {
    console.error('Debug registrations error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch registrations',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}