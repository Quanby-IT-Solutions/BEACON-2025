import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCheckoutSession } from '@/lib/paymongo';

const prisma = new PrismaClient();

// Verify payment-first registration completion
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutSessionId = searchParams.get('checkout_session_id');

    if (!checkoutSessionId) {
      return NextResponse.json(
        { success: false, error: 'Checkout session ID is required' },
        { status: 400 }
      );
    }

    console.log('Verifying payment-first registration for:', checkoutSessionId);

    // First, check if records were created by webhook (payment-first approach)
    const payment = await prisma.conferencePayment.findFirst({
      where: {
        paymongoCheckoutId: checkoutSessionId
      },
      include: {
        conference: {
          include: {
            user: {
              include: {
                UserAccounts: true,
                UserDetails: true
              }
            },
            summaryOfPayments: {
              include: {
                event: true
              }
            }
          }
        }
      }
    });

    if (payment && payment.isPaid) {
      // Records already exist from webhook - return success data
      return NextResponse.json({
        success: true,
        source: 'webhook_created',
        data: {
          conferenceId: payment.conference?.id,
          userId: payment.conference?.userId,
          totalAmount: Number(payment.totalAmount),
          paymentMethod: payment.paymongoPaymentMethod,
          referenceNumber: payment.paymongoReferenceId,
          isPaid: payment.isPaid,
          paymentConfirmedAt: payment.paymentConfirmedAt,
          participant: {
            name: `${payment.conference?.user?.UserDetails?.[0]?.firstName} ${payment.conference?.user?.UserDetails?.[0]?.lastName}`,
            email: payment.conference?.user?.UserAccounts?.[0]?.email,
          },
          events: payment.conference?.summaryOfPayments?.map(sop => ({
            id: sop.event.id,
            name: sop.eventName,
            date: sop.eventDate,
            price: Number(sop.eventPrice),
            status: sop.eventStatus
          })) || []
        }
      });
    }

    // If no records exist, check PayMongo and create them if payment was successful
    console.log('No existing records found, checking PayMongo status...');

    try {
      const checkoutSession = await getCheckoutSession(checkoutSessionId);
      const metadata = checkoutSession.attributes.metadata;
      
      console.log('PayMongo checkout session status:', checkoutSession.attributes.payment_status);
      console.log('Metadata paymentFirst flag:', metadata?.paymentFirst);

      if (checkoutSession.attributes.payment_status === 'paid' && metadata?.paymentFirst === 'true') {
        console.log('Payment successful, but records not created yet. Creating now...');

        // Retrieve form data from temporary storage (fallback if webhook failed)
        console.log('Success page: Retrieving registration data for fallback creation');
        const registrationRef = metadata.registrationRef;
        
        if (!registrationRef) {
          console.error('Success page: No registration reference found in metadata');
          throw new Error('Registration reference not found in payment metadata');
        }

        console.log('Success page: Retrieving registration data for ref:', registrationRef);

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

          console.log('Success page: Successfully retrieved form data from temporary storage');
          console.log('Success page: Number of events retrieved:', selectedEvents.length);

        } catch (error) {
          console.error('Success page: Failed to retrieve registration data from temporary storage:', error);
          throw new Error('Failed to retrieve registration data for payment processing');
        }

        if (!selectedEvents || selectedEvents.length === 0) {
          console.error('Success page: No events found in retrieved data');
          throw new Error('No events data found in registration');
        }

        const totalAmount = Number(metadata.totalAmount);

        // Create the registration records
        const createdRecords = await createRegistrationFromSuccess(
          formData,
          selectedEvents,
          totalAmount,
          {
            checkoutSessionId,
            paymentId: checkoutSession.attributes.payments?.[0]?.id,
            paymentMethod: checkoutSession.attributes.payments?.[0]?.attributes?.payment_method_type,
            referenceNumber: checkoutSession.attributes.payments?.[0]?.attributes?.reference_number,
          }
        );

        return NextResponse.json({
          success: true,
          source: 'success_page_created',
          data: createdRecords
        });

      } else if (checkoutSession.attributes.payment_status !== 'paid') {
        return NextResponse.json(
          { success: false, error: 'Payment not completed', paymentStatus: checkoutSession.attributes.payment_status },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: 'Not a payment-first registration' },
          { status: 400 }
        );
      }

    } catch (paymongoError) {
      console.error('PayMongo verification error:', paymongoError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify payment with PayMongo' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Payment success verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to create registration from success page (fallback)
async function createRegistrationFromSuccess(
  formData: any,
  selectedEvents: any[],
  totalAmount: number,
  paymentInfo: any
) {
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
      paymentConfirmedBy: 'success_page_fallback',
      
      paymongoCheckoutId: paymentInfo.checkoutSessionId,
      paymongoPaymentId: paymentInfo.paymentId,
      paymongoPaymentMethod: paymentInfo.paymentMethod,
      paymongoReferenceId: paymentInfo.referenceNumber,
      
      notes: `Registration created via success page fallback at ${new Date().toISOString()}`
    }
  });

  return {
    conferenceId: conference.id,
    userId: user.id,
    totalAmount: totalAmount,
    paymentMethod: paymentInfo.paymentMethod,
    referenceNumber: paymentInfo.referenceNumber,
    isPaid: true,
    paymentConfirmedAt: new Date(),
    participant: {
      name: `${user.UserDetails?.[0]?.firstName} ${user.UserDetails?.[0]?.lastName}`,
      email: user.UserAccounts?.[0]?.email,
    },
    events: selectedEvents.map(event => ({
      id: event.id,
      name: event.eventName,
      date: event.eventDate,
      price: Number(event.eventPrice),
      status: event.eventStatus
    }))
  };
}