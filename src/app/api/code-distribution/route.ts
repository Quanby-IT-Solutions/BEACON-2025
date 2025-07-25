import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for code validation
const codeValidationSchema = z.object({
  code: z.string().min(1, 'Code is required'),
});

// Validation schema for code creation (admin use)
const codeCreationSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  isActive: z.boolean().default(true),
});

// POST - Validate TML member code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = codeValidationSchema.parse(body);

    // Check if code exists and is active
    const codeDistribution = await prisma.codeDistribution.findUnique({
      where: { code: validatedData.code },
      include: {
        user: {
          select: {
            id: true,
            UserAccounts: {
              select: {
                email: true
              }
            },
            UserDetails: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!codeDistribution) {
      return NextResponse.json({
        success: false,
        error: 'Invalid code',
        message: 'The TML member code you entered is not valid.'
      }, { status: 400 });
    }

    if (!codeDistribution.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Inactive code',
        message: 'This TML member code is not active anymore and cannot be used for registration.'
      }, { status: 400 });
    }

    if (codeDistribution.userId) {
      return NextResponse.json({
        success: false,
        error: 'Code already used',
        message: 'This TML member code has already been used by another user.',
        usedBy: codeDistribution.user ? {
          name: `${codeDistribution.user.UserDetails[0]?.firstName} ${codeDistribution.user.UserDetails[0]?.lastName}`,
          email: codeDistribution.user.UserAccounts[0]?.email
        } : null
      }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      message: 'Valid TML member code',
      data: {
        code: codeDistribution.code,
        isValid: true,
        benefits: [
          'Free access to all conference events',
          'No registration fees',
          'Priority seating where applicable'
        ]
      }
    });

  } catch (error) {
    console.error('Code validation error:', error);

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

// PUT - Mark code as used by a specific user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId } = body;

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Code and userId are required' },
        { status: 400 }
      );
    }

    // Check if code exists and is active
    const codeDistribution = await prisma.codeDistribution.findUnique({
      where: { code }
    });

    if (!codeDistribution) {
      return NextResponse.json({
        success: false,
        error: 'Invalid code'
      }, { status: 400 });
    }

    if (!codeDistribution.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Inactive code',
        message: 'This TML member code is not active anymore and cannot be used for registration.'
      }, { status: 400 });
    }

    if (codeDistribution.userId && codeDistribution.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Code already used by another user'
      }, { status: 409 });
    }

    // Mark code as used
    const updatedCode = await prisma.codeDistribution.update({
      where: { code },
      data: { userId },
      include: {
        user: {
          select: {
            id: true,
            UserDetails: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Code marked as used successfully',
      data: updatedCode
    });

  } catch (error) {
    console.error('Code usage update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Get all codes (admin use) or check code status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const active = searchParams.get('active');
    const used = searchParams.get('used');

    if (code) {
      // Get specific code details
      const codeDistribution = await prisma.codeDistribution.findUnique({
        where: { code },
        include: {
          user: {
            select: {
              id: true,
              UserAccounts: {
                select: {
                  email: true
                }
              },
              UserDetails: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: codeDistribution
      });
    }

    // Get all codes with filters
    let whereClause: any = {};

    if (active === 'true') {
      whereClause.isActive = true;
    } else if (active === 'false') {
      whereClause.isActive = false;
    }

    if (used === 'true') {
      whereClause.userId = { not: null };
    } else if (used === 'false') {
      whereClause.userId = null;
    }

    const codes = await prisma.codeDistribution.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            UserAccounts: {
              select: {
                email: true
              }
            },
            UserDetails: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: codes,
      count: codes.length
    });

  } catch (error) {
    console.error('Error fetching codes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Deactivate or remove code (admin use)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const action = searchParams.get('action') || 'deactivate'; // 'deactivate' or 'delete'

    if (!code) {
      return NextResponse.json(
        { error: 'Code parameter is required' },
        { status: 400 }
      );
    }

    if (action === 'delete') {
      // Permanently delete the code
      await prisma.codeDistribution.delete({
        where: { code }
      });

      return NextResponse.json({
        success: true,
        message: 'Code deleted permanently'
      });
    } else {
      // Deactivate the code
      const updatedCode = await prisma.codeDistribution.update({
        where: { code },
        data: { isActive: false }
      });

      return NextResponse.json({
        success: true,
        message: 'Code deactivated successfully',
        data: updatedCode
      });
    }

  } catch (error) {
    console.error('Error deleting/deactivating code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}