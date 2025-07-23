import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession, phpToCentavos } from '@/lib/paymongo';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation schema for conference registration (same as before)
const conferenceRegistrationSchema = z.object({
  // Form-only fields
  selectedEventIds: z.array(z.string()).min(1, 'Please select at least one event'),
  faceScannedUrl: z.string().min(1, 'Face capture is required'),

  // UserDetails fields
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional().nullable(),
  suffix: z.string().optional().nullable(),
  preferredName: z.string().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY', 'OTHERS']),
  genderOthers: z.string().optional().nullable(),
  ageBracket: z.enum(['UNDER_18', 'AGE_18_24', 'AGE_25_34', 'AGE_35_44', 'AGE_45_54', 'AGE_55_ABOVE']),
  nationality: z.string().min(1, 'Nationality is required'),

  // UserAccounts fields
  email: z.string().email('Valid email is required'),
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  mailingAddress: z.string().optional().nullable(),

  // Conference model fields
  isMaritimeLeagueMember: z.enum(['YES', 'NO', 'APPLY_FOR_MEMBERSHIP']),
  tmlMemberCode: z.string().optional().nullable(),

  // Professional Information
  jobTitle: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  companyAddress: z.string().optional().nullable(),
  companyWebsite: z.string().optional().nullable(),

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
  ])).min(1, 'Please select at least one interest area'),
  otherInterests: z.string().optional().nullable(),
  receiveEventInvites: z.boolean().default(false),

  // Payment Details
  totalPaymentAmount: z.number().optional().nullable(),
  customPaymentAmount: z.string().optional().nullable(),
  paymentMode: z.enum(['BANK_DEPOSIT_TRANSFER', 'GCASH', 'WALK_IN_ON_SITE']).optional().nullable(),

  // Consent & Confirmation
  emailCertificate: z.boolean().default(false),
  photoVideoConsent: z.boolean().default(false),
  dataUsageConsent: z.boolean().refine(val => val === true, 'Data usage consent is required'),
});

// POST - Initiate payment (NO database records created yet)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = conferenceRegistrationSchema.parse(body);

    // Check if user email already exists (prevent duplicates)
    const existingUser = await prisma.user.findFirst({
      where: {
        UserAccounts: {
          some: {
            email: validatedData.email
          }
        }
      },
      include: {
        Conferences: true
      }
    });

    if (existingUser && existingUser.Conferences.length > 0) {
      return NextResponse.json(
        { error: 'User already has a conference registration' },
        { status: 400 }
      );
    }

    // Get selected events and calculate amount
    console.log("Fetching events for IDs:", validatedData.selectedEventIds);
    
    const selectedEvents = await prisma.events.findMany({
      where: {
        id: { in: validatedData.selectedEventIds },
        isActive: true
      }
    });

    console.log("Fetched events from database:", selectedEvents);
    console.log("Events count - Requested:", validatedData.selectedEventIds.length, "Found:", selectedEvents.length);

    if (selectedEvents.length === 0) {
      console.error("No events found for IDs:", validatedData.selectedEventIds);
      return NextResponse.json(
        { error: 'No valid events selected' },
        { status: 400 }
      );
    }

    if (selectedEvents.length !== validatedData.selectedEventIds.length) {
      console.error("Mismatch between requested and found events:", {
        requested: validatedData.selectedEventIds,
        found: selectedEvents.map(e => e.id)
      });
      return NextResponse.json(
        { 
          error: 'Some selected events were not found or are inactive',
          details: {
            requested: validatedData.selectedEventIds,
            found: selectedEvents.map(e => e.id)
          }
        },
        { status: 400 }
      );
    }

    // Calculate total amount
    let calculatedAmount = selectedEvents.reduce((total, event) => {
      return total + Number(event.eventPrice);
    }, 0);

    // Apply conference discount if all 3 CONFERENCE events are selected
    const conferenceEvents = selectedEvents.filter(event => event.eventStatus === 'CONFERENCE');
    if (conferenceEvents.length === 3) {
      const totalConferenceEvents = await prisma.events.count({
        where: {
          eventStatus: 'CONFERENCE',
          isActive: true
        }
      });

      if (totalConferenceEvents === 3) {
        calculatedAmount -= 1500; // Apply discount
      }
    }

    // Check if payment is required
    const requiresPayment = validatedData.isMaritimeLeagueMember === 'NO' && calculatedAmount > 0;
    const paymentMode = validatedData.paymentMode || 'GCASH';
    const isWalkInPayment = paymentMode === 'WALK_IN_ON_SITE';

    // For TML members or walk-in payments, create records immediately
    if (!requiresPayment || isWalkInPayment) {
      // Create records directly for non-payment or walk-in cases
      return await createConferenceRegistration(validatedData, selectedEvents, calculatedAmount, false);
    }

    // For online payments, create PayMongo session with ALL form data in metadata
    try {
      // Create detailed line items (without separate discount line item)
      const lineItems = selectedEvents.map(event => ({
        currency: 'PHP',
        amount: phpToCentavos(Number(event.eventPrice)),
        description: `${event.eventName} - ${event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBD'}`,
        name: event.eventName,
        quantity: 1,
      }));

      // Add a summary line item if discount is applied (show total with discount)
      let description = `BEACON 2025 Conference Registration - ${validatedData.firstName} ${validatedData.lastName}`;
      if (conferenceEvents.length === 3) {
        description += ` (₱1,500 Conference Package Discount Applied)`;
      }

      // Generate registration reference for temporary storage
      const registrationRef = `conf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store large registration data temporarily (to avoid PayMongo metadata size limits)
      try {
        const tempStoreResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/conference/payment/temp-store`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            registrationRef,
            formData: validatedData,
            selectedEvents: selectedEvents
          })
        });

        if (!tempStoreResponse.ok) {
          const errorText = await tempStoreResponse.text();
          console.error('Failed to store temporary registration data:', errorText);
          throw new Error('Failed to store registration data for payment processing');
        }

        const storeResult = await tempStoreResponse.json();
        console.log('Successfully stored temporary registration data with ref:', registrationRef, storeResult);
        
      } catch (error) {
        console.error('Error storing temporary registration data:', error);
        throw new Error('Failed to store registration data for payment processing');
      }

      // Create PayMongo checkout session with minimal metadata
      const checkoutSessionData = await createCheckoutSession({
        amount: phpToCentavos(calculatedAmount),
        description: description,
        line_items: lineItems,
        customer: {
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          email: validatedData.email,
          phone: validatedData.mobileNumber,
        },
        metadata: {
          // Registration flags
          conferenceRegistration: 'true',
          paymentFirst: 'true',
          
          // Event data (simplified)
          eventCount: selectedEvents.length.toString(),
          eventIds: validatedData.selectedEventIds.join(','),
          totalAmount: calculatedAmount.toString(),
          
          // Essential user data only
          email: validatedData.email,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          
          // Reference to retrieve full data
          registrationRef: registrationRef,
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          paymongoCheckoutUrl: checkoutSessionData.attributes.checkout_url,
          paymongoCheckoutId: checkoutSessionData.id,
          totalAmount: calculatedAmount,
          requiresPayment: true,
          message: 'Redirecting to payment gateway...'
        }
      }, { status: 200 });

    } catch (error) {
      console.error('PayMongo checkout session creation failed:', error);
      return NextResponse.json(
        { error: 'Payment gateway initialization failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Conference registration initiation error:', error);

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

// Helper function to create conference registration records
async function createConferenceRegistration(
  validatedData: any,
  selectedEvents: any[],
  calculatedAmount: number,
  isPaidOnline: boolean = false
) {
  // Create user with accounts and details
  const user = await prisma.user.create({
    data: {
      UserAccounts: {
        create: {
          email: validatedData.email,
          mobileNumber: validatedData.mobileNumber,
          mailingAddress: validatedData.mailingAddress,
          status: 'ACTIVE'
        }
      },
      UserDetails: {
        create: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          middleName: validatedData.middleName,
          suffix: validatedData.suffix,
          preferredName: validatedData.preferredName,
          gender: validatedData.gender,
          genderOthers: validatedData.genderOthers,
          ageBracket: validatedData.ageBracket,
          nationality: validatedData.nationality,
          faceScannedUrl: validatedData.faceScannedUrl
        }
      }
    },
    include: {
      UserAccounts: true,
      UserDetails: true
    }
  });

  // Create conference registration
  const conference = await prisma.conference.create({
    data: {
      userId: user.id,
      isMaritimeLeagueMember: validatedData.isMaritimeLeagueMember,
      tmlMemberCode: validatedData.tmlMemberCode,
      jobTitle: validatedData.jobTitle,
      companyName: validatedData.companyName,
      industry: validatedData.industry,
      companyAddress: validatedData.companyAddress,
      companyWebsite: validatedData.companyWebsite,
      interestAreas: validatedData.interestAreas,
      otherInterests: validatedData.otherInterests,
      receiveEventInvites: validatedData.receiveEventInvites || false,
      totalPaymentAmount: calculatedAmount,
      customPaymentAmount: validatedData.customPaymentAmount,
      emailCertificate: validatedData.emailCertificate || false,
      photoVideoConsent: validatedData.photoVideoConsent || false,
      dataUsageConsent: validatedData.dataUsageConsent,
      requiresPayment: calculatedAmount > 0 && validatedData.isMaritimeLeagueMember === 'NO',
    }
  });

  // Create summary of payments
  if (selectedEvents.length > 0) {
    const summaryEntries = selectedEvents.map(event => ({
      conferenceId: conference.id,
      eventId: event.id,
      eventName: event.eventName,
      eventDate: event.eventDate,
      eventPrice: event.eventPrice,
      eventStatus: event.eventStatus,
    }));

    await prisma.summaryOfPayments.createMany({
      data: summaryEntries
    });
  }

  // Create payment record if needed
  if (calculatedAmount > 0 && validatedData.isMaritimeLeagueMember === 'NO') {
    await prisma.conferencePayment.create({
      data: {
        conferenceId: conference.id,
        totalAmount: calculatedAmount,
        paymentMode: validatedData.paymentMode || 'GCASH',
        paymentStatus: isPaidOnline ? 'CONFIRMED' : 'PENDING',
        isPaid: isPaidOnline,
        paymentDate: isPaidOnline ? new Date() : null,
        paymentConfirmedAt: isPaidOnline ? new Date() : null,
        paymentConfirmedBy: isPaidOnline ? 'paymongo_webhook' : null,
        notes: isPaidOnline 
          ? 'Online payment confirmed via PayMongo'
          : validatedData.paymentMode === 'WALK_IN_ON_SITE'
            ? 'Walk-in payment - Awaiting on-site confirmation'
            : 'Payment pending'
      }
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      conferenceId: conference.id,
      userId: user.id,
      totalAmount: calculatedAmount,
      requiresPayment: calculatedAmount > 0 && validatedData.isMaritimeLeagueMember === 'NO',
      message: 'Registration completed successfully!'
    }
  }, { status: 201 });
}