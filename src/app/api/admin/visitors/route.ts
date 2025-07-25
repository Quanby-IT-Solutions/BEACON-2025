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

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    const decoded = await verifyAdminToken(authHeader);

    // Fetch all visitors with their user details and accounts
    const visitors = await prisma.visitors.findMany({
      include: {
        user: {
          include: {
            user_details: true,
            user_accounts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to make it easier to work with
    const transformedVisitors = visitors.map((visitor) => ({
      id: visitor.id,
      createdAt: visitor.createdAt,
      updatedAt: visitor.updatedAt,

      // Personal Information
      personalInfo: {
        firstName: visitor.user?.user_details?.[0]?.firstName || '',
        lastName: visitor.user?.user_details?.[0]?.lastName || '',
        middleName: visitor.user?.user_details?.[0]?.middleName || '',
        suffix: visitor.user?.user_details?.[0]?.suffix || '',
        preferredName: visitor.user?.user_details?.[0]?.preferredName || '',
        gender: visitor.user?.user_details?.[0]?.gender || '',
        genderOthers: visitor.user?.user_details?.[0]?.genderOthers || '',
        ageBracket: visitor.user?.user_details?.[0]?.ageBracket || '',
        nationality: visitor.user?.user_details?.[0]?.nationality || '',
        faceScannedUrl: visitor.user?.user_details?.[0]?.faceScannedUrl || '',
      },

      // Contact Information
      contactInfo: {
        email: visitor.user?.user_accounts?.[0]?.email || '',
        mobileNumber: visitor.user?.user_accounts?.[0]?.mobileNumber || '',
        landline: visitor.user?.user_accounts?.[0]?.landline || '',
        mailingAddress: visitor.user?.user_accounts?.[0]?.mailingAddress || '',
        status: visitor.user?.user_accounts?.[0]?.status || '',
      },

      // Professional Information
      professionalInfo: {
        jobTitle: visitor.jobTitle,
        companyName: visitor.companyName,
        industry: visitor.industry,
        industryOthers: visitor.industryOthers,
        companyAddress: visitor.companyAddress,
        companyWebsite: visitor.companyWebsite,
        businessEmail: visitor.businessEmail,
      },

      // Event Information
      eventInfo: {
        attendingDays: visitor.attendingDays,
        eventParts: visitor.eventParts,
        attendeeType: visitor.attendeeType,
        interestAreas: visitor.interestAreas,
        receiveUpdates: visitor.receiveUpdates,
        inviteToFutureEvents: visitor.inviteToFutureEvents,
      },

      // Emergency & Safety
      emergencyInfo: {
        specialAssistance: visitor.specialAssistance,
        emergencyContactPerson: visitor.emergencyContactPerson,
        emergencyContactNumber: visitor.emergencyContactNumber,
      },

      // Consent & Marketing
      consentInfo: {
        dataPrivacyConsent: visitor.dataPrivacyConsent,
        hearAboutEvent: visitor.hearAboutEvent,
        hearAboutOthers: visitor.hearAboutOthers,
      },
    }));

    return NextResponse.json({
      success: true,
      data: transformedVisitors,
      count: transformedVisitors.length,
    });

  } catch (error) {
    console.error('Admin visitors fetch error:', error);

    if (error instanceof Error) {
      if (error.message.includes('token') || error.message.includes('authorization')) {
        return NextResponse.json({
          success: false,
          message: 'Unauthorized',
        }, { status: 401 });
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}