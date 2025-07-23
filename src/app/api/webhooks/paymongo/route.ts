import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// PayMongo webhook endpoint to handle payment confirmations
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = (await headers()).get('paymongo-signature');

    console.log('PayMongo webhook received:', {
      signature,
      bodyLength: body.length,
      body: body.substring(0, 200) + '...' // Log first 200 chars for debugging
    });

    // Parse the webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log('Parsed webhook data:', JSON.stringify(webhookData, null, 2));

    // Extract event data
    const { data: eventData } = webhookData;
    if (!eventData) {
      console.error('No event data in webhook');
      return NextResponse.json({ error: 'No event data' }, { status: 400 });
    }

    const eventType = eventData.attributes?.type;
    const eventAttributes = eventData.attributes?.data?.attributes;

    console.log('Event type:', eventType);
    console.log('Event attributes:', eventAttributes);

    // Handle different webhook events
    switch (eventType) {
      case 'checkout_session.payment.paid':
      case 'payment.paid':
        await handlePaymentPaid(eventData, eventAttributes);
        break;

      case 'checkout_session.payment.failed':
      case 'payment.failed':
        await handlePaymentFailed(eventData, eventAttributes);
        break;

      default:
        console.log('Unhandled webhook event type:', eventType);
        break;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('PayMongo webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Handle successful payment (NEW: Payment-first approach)
async function handlePaymentPaid(eventData: any, attributes: any) {
  try {
    console.log('Processing payment.paid event:', attributes);

    // Get checkout session ID and payment details
    const checkoutSessionId = attributes?.checkout_session_id || eventData.id;
    const paymentId = attributes?.id;
    const paymentIntentId = attributes?.payment_intent_id;
    const amount = attributes?.amount;
    const currency = attributes?.currency;
    const paymentMethod = attributes?.payment_method_type;
    const referenceNumber = attributes?.reference_number;

    console.log('Payment details:', {
      checkoutSessionId,
      paymentId,
      paymentIntentId,
      amount,
      currency,
      paymentMethod,
      referenceNumber
    });

    // Get checkout session metadata from PayMongo
    const { getCheckoutSession } = await import('@/lib/paymongo');
    const checkoutSession = await getCheckoutSession(checkoutSessionId);
    const metadata = checkoutSession.attributes.metadata;

    console.log('Checkout session metadata:', metadata);

    // Check if this is a payment-first registration
    if (metadata?.paymentFirst === 'true') {
      console.log('Processing payment-first registration...');

      // Retrieve form data from temporary storage
      console.log('Raw metadata received:', metadata);
      const registrationRef = metadata.registrationRef;
      
      if (!registrationRef) {
        console.error('No registration reference found in metadata');
        throw new Error('Registration reference not found in payment metadata');
      }

      console.log('Retrieving registration data for ref:', registrationRef);

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

        console.log('Successfully retrieved form data from temporary storage');
        console.log('Number of events retrieved:', selectedEvents.length);

      } catch (error) {
        console.error('Failed to retrieve registration data from temporary storage:', error);
        throw new Error('Failed to retrieve registration data for payment processing');
      }

      if (!selectedEvents || selectedEvents.length === 0) {
        console.error('No events found in retrieved data');
        throw new Error('No events data found in registration');
      }

      // Create all database records now that payment is confirmed
      await createConferenceRegistrationFromPayment(
        formData,
        selectedEvents,
        Number(metadata.totalAmount),
        {
          checkoutSessionId,
          paymentId,
          paymentIntentId,
          paymentMethod,
          referenceNumber,
          webhookId: eventData.id
        }
      );

      console.log('Conference registration created successfully after payment confirmation');

    } else {
      // OLD FLOW: Update existing payment record
      console.log('Processing existing payment record update...');

      let payment = await prisma.conferencePayment.findFirst({
        where: {
          paymongoCheckoutId: checkoutSessionId
        }
      });

      if (!payment && paymentIntentId) {
        payment = await prisma.conferencePayment.findFirst({
          where: {
            paymongoIntentId: paymentIntentId
          }
        });
      }

      if (!payment) {
        console.error('Conference payment not found for checkout session:', checkoutSessionId);
        return;
      }

      // Update existing payment status
      const updatedPayment = await prisma.conferencePayment.update({
        where: { id: payment.id },
        data: {
          isPaid: true,
          paymentStatus: 'CONFIRMED',
          paymentDate: new Date(),
          paymentConfirmedAt: new Date(),
          paymentConfirmedBy: null,
          paymongoPaymentId: paymentId,
          paymongoIntentId: paymentIntentId,
          paymongoWebhookId: eventData.id,
          paymongoPaymentMethod: paymentMethod,
          paymongoReferenceId: referenceNumber,
          notes: `Online payment automatically confirmed via PayMongo webhook - ${eventData.attributes?.type} - ${new Date().toISOString()}`
        }
      });

      console.log('Existing payment updated successfully:', updatedPayment.id);
    }

  } catch (error) {
    console.error('Error handling payment.paid:', error);
    throw error;
  }
}

// Helper function to create conference registration after successful payment
async function createConferenceRegistrationFromPayment(
  formData: any,
  selectedEvents: any[],
  totalAmount: number,
  paymentInfo: any
) {
  try {
    // Check if user already exists (prevent duplicates)
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
      // Create new user with accounts and details
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
    } else {
      // Update existing user data
      await prisma.userAccounts.update({
        where: { id: user.UserAccounts[0].id },
        data: {
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          mailingAddress: formData.mailingAddress
        }
      });

      await prisma.userDetails.update({
        where: { id: user.UserDetails[0].id },
        data: {
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
        requiresPayment: true, // Payment was required and completed
      }
    });

    // Create summary of payments
    console.log('Creating summary of payments for events:', selectedEvents);

    if (selectedEvents && selectedEvents.length > 0) {
      const summaryEntries = selectedEvents.map(event => {
        console.log('Processing event for summary:', event);
        return {
          conferenceId: conference.id,
          eventId: event.id,
          eventName: event.eventName,
          eventDate: event.eventDate,
          eventPrice: event.eventPrice,
          eventStatus: event.eventStatus,
        };
      });

      console.log('Summary entries to create:', summaryEntries);

      await prisma.summaryOfPayments.createMany({
        data: summaryEntries
      });

      console.log('Successfully created summary of payments');
    } else {
      console.error('No events available for summary of payments');
      throw new Error('Cannot create conference registration without events');
    }

    // Create confirmed payment record
    await prisma.conferencePayment.create({
      data: {
        conferenceId: conference.id,
        totalAmount: totalAmount,
        paymentMode: formData.paymentMode || 'GCASH',
        paymentStatus: 'CONFIRMED', // Already confirmed by PayMongo
        isPaid: true,
        paymentDate: new Date(),
        paymentConfirmedAt: new Date(),
        paymentConfirmedBy: null,

        // PayMongo details
        paymongoCheckoutId: paymentInfo.checkoutSessionId,
        paymongoPaymentId: paymentInfo.paymentId,
        paymongoIntentId: paymentInfo.paymentIntentId,
        paymongoWebhookId: paymentInfo.webhookId,
        paymongoPaymentMethod: paymentInfo.paymentMethod,
        paymongoReferenceId: paymentInfo.referenceNumber,

        notes: `Conference registration created and payment confirmed via PayMongo webhook at ${new Date().toISOString()}`
      }
    });

    console.log('Conference registration and payment created successfully:', conference.id);

  } catch (error) {
    console.error('Error creating conference registration from payment:', error);
    throw error;
  }
}

// Handle failed payment
async function handlePaymentFailed(eventData: any, attributes: any) {
  try {
    console.log('Processing payment.failed event:', attributes);

    const checkoutSessionId = attributes?.checkout_session_id || eventData.id;
    const paymentIntentId = attributes?.payment_intent_id;

    // Find the conference payment record
    let payment = null;

    if (checkoutSessionId) {
      payment = await prisma.conferencePayment.findFirst({
        where: {
          paymongoCheckoutId: checkoutSessionId
        }
      });
    }

    if (!payment && paymentIntentId) {
      payment = await prisma.conferencePayment.findFirst({
        where: {
          paymongoIntentId: paymentIntentId
        }
      });
    }

    if (!payment) {
      console.error('Conference payment not found for failed payment:', checkoutSessionId);
      return;
    }

    // Update payment status to failed
    await prisma.conferencePayment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: 'FAILED',
        paymongoWebhookId: eventData.id,
        notes: `Payment failed via PayMongo webhook - ${eventData.attributes?.type} - ${new Date().toISOString()}`
      }
    });

    console.log('Payment marked as failed:', payment.id);

  } catch (error) {
    console.error('Error handling payment.failed:', error);
    throw error;
  }
}

// GET handler for webhook verification (optional)
export async function GET() {
  return NextResponse.json({
    message: 'PayMongo webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}