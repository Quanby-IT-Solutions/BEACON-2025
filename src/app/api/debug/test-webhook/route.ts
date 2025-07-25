import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test endpoint to simulate PayMongo webhook
export async function POST(request: NextRequest) {
  try {
    const { checkoutSessionId } = await request.json();
    
    if (!checkoutSessionId) {
      return NextResponse.json({ error: 'checkoutSessionId required' }, { status: 400 });
    }

    console.log('Testing webhook for checkout session:', checkoutSessionId);

    // Get checkout session metadata from PayMongo
    const { getCheckoutSession } = await import('@/lib/paymongo');
    
    let checkoutSession;
    try {
      checkoutSession = await getCheckoutSession(checkoutSessionId);
    } catch (error) {
      console.error('Failed to get checkout session:', error);
      return NextResponse.json({ 
        error: 'Failed to get checkout session from PayMongo',
        details: error.message 
      }, { status: 400 });
    }

    const metadata = checkoutSession.attributes.metadata;
    console.log('Checkout session metadata:', metadata);

    // Check if this is a payment-first registration
    if (metadata?.paymentFirst === 'true') {
      console.log('Processing payment-first registration...');

      const registrationRef = metadata.registrationRef;
      
      if (!registrationRef) {
        return NextResponse.json({ 
          error: 'No registration reference found in metadata' 
        }, { status: 400 });
      }

      // Retrieve form data from temporary storage
      let formData, selectedEvents;
      try {
        const tempDataResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/conference/payment/temp-store?registrationRef=${registrationRef}`);
        
        if (!tempDataResponse.ok) {
          throw new Error(`Failed to retrieve registration data: ${tempDataResponse.status}`);
        }

        const tempData = await tempDataResponse.json();
        
        if (!tempData.success) {
          throw new Error(`Registration data not found: ${tempData.error}`);
        }

        formData = tempData.data.formData;
        selectedEvents = tempData.data.selectedEvents;

      } catch (error) {
        return NextResponse.json({ 
          error: 'Failed to retrieve registration data',
          details: error.message 
        }, { status: 400 });
      }

      // Simulate payment info
      const paymentInfo = {
        checkoutSessionId: checkoutSessionId,
        paymentId: 'test_payment_' + Date.now(),
        paymentIntentId: 'test_intent_' + Date.now(),
        paymentMethod: 'gcash',
        referenceNumber: 'TEST_' + Date.now(),
        webhookId: 'test_webhook_' + Date.now()
      };

      // Create conference registration
      await createConferenceRegistrationFromPayment(
        formData,
        selectedEvents,
        Number(metadata.totalAmount),
        paymentInfo
      );

      return NextResponse.json({
        success: true,
        message: 'Test webhook processed successfully',
        data: {
          checkoutSessionId,
          registrationRef,
          totalAmount: metadata.totalAmount,
          eventsCount: selectedEvents.length
        }
      });

    } else {
      return NextResponse.json({ 
        error: 'Not a payment-first registration',
        metadata 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json({
      error: 'Test webhook failed',
      details: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function (copied from webhook route)
async function createConferenceRegistrationFromPayment(
  formData: any,
  selectedEvents: any[],
  totalAmount: number,
  paymentInfo: any
) {
  try {
    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        UserAccounts: {
          some: {
            email: formData.email
          }
        }
      },
      include: {
        UserAccounts: true,
        UserDetails: true,
        Conferences: true
      }
    });

    if (user && user.Conferences.length > 0) {
      throw new Error('User already has a conference registration');
    }

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          UserAccounts: {
            create: {
              email: formData.email,
              mobileNumber: formData.mobileNumber,
              mailingAddress: formData.mailingAddress,
              status: 'ACTIVE'
            }
          },
          UserDetails: {
            create: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              middleName: formData.middleName,
              suffix: formData.suffix,
              preferredName: formData.preferredName,
              gender: formData.gender,
              genderOthers: formData.genderOthers,
              ageBracket: formData.ageBracket,
              nationality: formData.nationality,
              faceScannedUrl: formData.faceScannedUrl
            }
          }
        },
        include: {
          UserAccounts: true,
          UserDetails: true,
          Conferences: true
        }
      });
    }

    // Create conference registration
    const conference = await prisma.conference.create({
      data: {
        userId: user.id,
        isMaritimeLeagueMember: formData.isMaritimeLeagueMember,
        tmlMemberCode: formData.tmlMemberCode,
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        industry: formData.industry,
        companyAddress: formData.companyAddress,
        companyWebsite: formData.companyWebsite,
        interestAreas: formData.interestAreas,
        otherInterests: formData.otherInterests,
        receiveEventInvites: formData.receiveEventInvites || false,
        totalPaymentAmount: totalAmount,
        customPaymentAmount: formData.customPaymentAmount,
        emailCertificate: formData.emailCertificate || false,
        photoVideoConsent: formData.photoVideoConsent || false,
        dataUsageConsent: formData.dataUsageConsent,
        requiresPayment: true,
      }
    });

    // Create summary of payments
    if (selectedEvents && selectedEvents.length > 0) {
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

    // Create confirmed payment record
    await prisma.conferencePayment.create({
      data: {
        conferenceId: conference.id,
        totalAmount: totalAmount,
        paymentMode: formData.paymentMode || 'GCASH',
        paymentStatus: 'CONFIRMED',
        isPaid: true,
        paymentDate: new Date(),
        paymentConfirmedAt: new Date(),
        paymentConfirmedBy: 'test_webhook',
        paymongoCheckoutId: paymentInfo.checkoutSessionId,
        paymongoPaymentId: paymentInfo.paymentId,
        paymongoIntentId: paymentInfo.paymentIntentId,
        paymongoWebhookId: paymentInfo.webhookId,
        paymongoPaymentMethod: paymentInfo.paymentMethod,
        paymongoReferenceId: paymentInfo.referenceNumber,
        notes: `TEST: Conference registration created and payment confirmed via test webhook at ${new Date().toISOString()}`
      }
    });

    console.log('Test conference registration created successfully:', conference.id);

  } catch (error) {
    console.error('Error creating test conference registration:', error);
    throw error;
  }
}