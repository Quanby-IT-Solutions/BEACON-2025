import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for conference registration
const conferenceRegistrationSchema = z.object({
  // Maritime League Membership
  isMaritimeLeagueMember: z.enum(['YES', 'NO', 'APPLY_FOR_MEMBERSHIP']),
  tmlMemberCode: z.string().optional(),

  // Event Registration
  registerForConference: z.boolean(),
  registerBoatShow: z.boolean().default(false),
  registerBlueRunway: z.boolean().default(false),

  // Conference Registration (if selected)
  conferenceDuration: z.enum(['ONE_DAY', 'TWO_DAYS', 'THREE_DAYS']).optional(),
  attendingDay1: z.boolean().default(false),
  attendingDay2: z.boolean().default(false),
  attendingDay3: z.boolean().default(false),

  // Personal Information
  fullName: z.string().min(1, 'Full name is required'),
  preferredName: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY', 'OTHERS']),
  ageBracket: z.enum(['UNDER_18', 'AGE_18_24', 'AGE_25_34', 'AGE_35_44', 'AGE_45_54', 'AGE_55_ABOVE']),
  nationality: z.string().min(1, 'Nationality is required'),

  // Contact Details
  email: z.string().email('Valid email is required'),
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  mailingAddress: z.string().optional(),

  // Professional Information
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  companyAddress: z.string().optional(),
  companyWebsite: z.string().optional(),

  // Areas of Interest
  interestAreas: z.array(z.enum([
    'SHIPBUILDING_SHIP_REPAIR',
    'BOATBUILDING_YACHT_BUILDING',
    'MARINE_TECHNOLOGY',
    'NAVAL_DEFENSE_SECURITY',
    'MARITIME_TOURISM',
    'INNOVATION_SUSTAINABILITY',
    'BLUE_ECONOMY',
    'LIFESTYLE_FASHION',
    'WOMEN_YOUTH_IN_MARITIME',
    'OTHERS'
  ])),
  otherInterests: z.string().optional(),
  receiveEventInvites: z.boolean().default(false),

  // Payment Details
  totalPaymentAmount: z.number().optional(),
  customPaymentAmount: z.string().optional(),

  // Consent & Confirmation
  emailCertificate: z.boolean().default(false),
  photoVideoConsent: z.boolean().default(false),
  dataUsageConsent: z.boolean().refine(val => val === true, 'Data usage consent is required'),
});

// POST - Create new conference registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = conferenceRegistrationSchema.parse(body);

    // Check if user already has a registration
    const existingUser = await prisma.user.findFirst({
      where: {
        UserAccounts: {
          some: {
            email: validatedData.email
          }
        }
      },
      include: {
        UserAccounts: true,
        UserDetails: true,
        Conferences: true
      }
    });

    let user;
    let userAccount;
    let userDetails;

    if (existingUser) {
      user = existingUser;
      userAccount = existingUser.UserAccounts[0];
      userDetails = existingUser.UserDetails[0];

      // Check if user already has a conference registration
      if (existingUser.Conferences.length > 0) {
        return NextResponse.json(
          { error: 'User already has a conference registration' },
          { status: 400 }
        );
      }
    } else {
      // Create new user with accounts and details
      user = await prisma.user.create({
        data: {
          UserAccounts: {
            create: {
              email: validatedData.email,
              mobileNumber: validatedData.mobileNumber,
              status: 'ACTIVE'
            }
          },
          UserDetails: {
            create: {
              firstName: validatedData.fullName.split(' ')[0],
              lastName: validatedData.fullName.split(' ').slice(1).join(' ') || validatedData.fullName.split(' ')[0],
              preferredName: validatedData.preferredName,
              gender: validatedData.gender,
              ageBracket: validatedData.ageBracket,
              nationality: validatedData.nationality
            }
          }
        },
        include: {
          UserAccounts: true,
          UserDetails: true
        }
      });

      userAccount = user.UserAccounts[0];
      userDetails = user.UserDetails[0];
    }

    // Determine if payment is required (non-maritime league members)
    const requiresPayment = validatedData.isMaritimeLeagueMember === 'NO';

    // Calculate total payment amount
    let calculatedAmount = 0;
    if (validatedData.registerForConference && validatedData.conferenceDuration) {
      switch (validatedData.conferenceDuration) {
        case 'ONE_DAY':
          calculatedAmount += 3000;
          break;
        case 'TWO_DAYS':
          calculatedAmount += 6000;
          break;
        case 'THREE_DAYS':
          calculatedAmount += 7500;
          break;
      }
    }
    if (validatedData.registerBlueRunway) {
      calculatedAmount += 2000;
    }

    // Generate payment token if payment is required
    const paymentToken = requiresPayment ? `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null;
    const paymentTokenExpiry = requiresPayment ? new Date(Date.now() + 3 * 60 * 60 * 1000) : null; // 3 hours

    // Create conference registration
    const conference = await prisma.conference.create({
      data: {
        userId: user.id,
        isMaritimeLeagueMember: validatedData.isMaritimeLeagueMember,
        tmlMemberCode: validatedData.tmlMemberCode,
        registerForConference: validatedData.registerForConference,
        registerBoatShow: validatedData.registerBoatShow,
        registerBlueRunway: validatedData.registerBlueRunway,
        conferenceDuration: validatedData.conferenceDuration,
        attendingDay1: validatedData.attendingDay1,
        attendingDay2: validatedData.attendingDay2,
        attendingDay3: validatedData.attendingDay3,
        fullName: validatedData.fullName,
        preferredName: validatedData.preferredName,
        gender: validatedData.gender,
        ageBracket: validatedData.ageBracket,
        nationality: validatedData.nationality,
        email: validatedData.email,
        mobileNumber: validatedData.mobileNumber,
        mailingAddress: validatedData.mailingAddress,
        jobTitle: validatedData.jobTitle,
        companyName: validatedData.companyName,
        industry: validatedData.industry,
        companyAddress: validatedData.companyAddress,
        companyWebsite: validatedData.companyWebsite,
        interestAreas: validatedData.interestAreas,
        otherInterests: validatedData.otherInterests,
        receiveEventInvites: validatedData.receiveEventInvites,
        totalPaymentAmount: calculatedAmount,
        customPaymentAmount: validatedData.customPaymentAmount,
        emailCertificate: validatedData.emailCertificate,
        photoVideoConsent: validatedData.photoVideoConsent,
        dataUsageConsent: validatedData.dataUsageConsent,
        paymentToken,
        paymentTokenExpiry,
        requiresPayment,
      },
      include: {
        user: {
          include: {
            UserAccounts: true,
            UserDetails: true
          }
        }
      }
    });

    // Create payment record if payment is required
    if (requiresPayment && calculatedAmount > 0) {
      await prisma.conferencePayment.create({
        data: {
          conferenceId: conference.id,
          totalAmount: calculatedAmount,
          paymentMode: 'BANK_DEPOSIT_TRANSFER', // Default, can be updated later
          paymentStatus: 'PENDING',
          conferenceAmount: validatedData.registerForConference ? (calculatedAmount - (validatedData.registerBlueRunway ? 2000 : 0)) : null,
          blueRunwayAmount: validatedData.registerBlueRunway ? 2000 : null,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        conferenceId: conference.id,
        userId: user.id,
        requiresPayment,
        totalAmount: calculatedAmount,
        paymentToken,
        paymentTokenExpiry
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Conference registration error:', error);

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

// GET - Retrieve conference registrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const conferenceId = searchParams.get('conferenceId');

    if (!userId && !email && !conferenceId) {
      return NextResponse.json(
        { error: 'userId, email, or conferenceId parameter is required' },
        { status: 400 }
      );
    }

    let whereClause: any = {};

    if (conferenceId) {
      whereClause.id = conferenceId;
    } else if (userId) {
      whereClause.userId = userId;
    } else if (email) {
      whereClause.email = email;
    }

    const conferences = await prisma.conference.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            UserAccounts: true,
            UserDetails: true
          }
        },
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: conferences
    });

  } catch (error) {
    console.error('Error fetching conference registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update conference registration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { conferenceId, ...updateData } = body;

    if (!conferenceId) {
      return NextResponse.json(
        { error: 'conferenceId is required' },
        { status: 400 }
      );
    }

    // Validate update data with partial schema
    const partialSchema = conferenceRegistrationSchema.partial();
    const validatedData = partialSchema.parse(updateData);

    const updatedConference = await prisma.conference.update({
      where: { id: conferenceId },
      data: validatedData,
      include: {
        user: {
          include: {
            UserAccounts: true,
            UserDetails: true
          }
        },
        payment: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedConference
    });

  } catch (error) {
    console.error('Error updating conference registration:', error);

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

// DELETE - Remove conference registration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get('conferenceId');

    if (!conferenceId) {
      return NextResponse.json(
        { error: 'conferenceId parameter is required' },
        { status: 400 }
      );
    }

    await prisma.conference.delete({
      where: { id: conferenceId }
    });

    return NextResponse.json({
      success: true,
      message: 'Conference registration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting conference registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}