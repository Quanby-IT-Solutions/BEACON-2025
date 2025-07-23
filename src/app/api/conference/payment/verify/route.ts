import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCheckoutSession } from '@/lib/paymongo';

const prisma = new PrismaClient();

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

    // Get payment record from database
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

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Verify with PayMongo if not already verified
    if (!payment.isPaid) {
      try {
        const checkoutSession = await getCheckoutSession(checkoutSessionId);
        
        // Check if payment was successful
        if (checkoutSession.attributes.payment_status === 'paid') {
          const paymentData = checkoutSession.attributes.payments?.[0]?.attributes;
          
          // Update payment status in database
          await prisma.conferencePayment.update({
            where: { id: payment.id },
            data: {
              isPaid: true,
              paymentConfirmedAt: new Date(),
              paymentConfirmedBy: 'automatic_verification',
              paymentStatus: 'CONFIRMED',
              paymentDate: new Date(), // Set actual payment date
              paymongoPaymentId: checkoutSession.attributes.payments?.[0]?.id || null,
              paymongoPaymentMethod: paymentData?.payment_method_type || null,
              paymongoReferenceId: paymentData?.reference_number || null,
              notes: `Online payment automatically confirmed via API verification at ${new Date().toISOString()}`
            }
          });

          // Reload payment with updated data
          const updatedPayment = await prisma.conferencePayment.findUnique({
            where: { id: payment.id },
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

          return NextResponse.json({
            success: true,
            data: {
              conferenceId: updatedPayment?.conference?.id,
              userId: updatedPayment?.conference?.userId,
              totalAmount: Number(updatedPayment?.totalAmount),
              paymentMethod: updatedPayment?.paymongoPaymentMethod,
              referenceNumber: updatedPayment?.paymongoReferenceId,
              isPaid: updatedPayment?.isPaid,
              paymentConfirmedAt: updatedPayment?.paymentConfirmedAt,
              events: updatedPayment?.conference?.summaryOfPayments?.map(sop => sop.event) || []
            }
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'Payment not completed' },
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
    }

    // Payment already verified
    return NextResponse.json({
      success: true,
      data: {
        conferenceId: payment.conference?.id,
        userId: payment.conference?.userId,
        totalAmount: Number(payment.totalAmount),
        paymentMethod: payment.paymongoPaymentMethod,
        referenceNumber: payment.paymongoReferenceId,
        isPaid: payment.isPaid,
        paymentConfirmedAt: payment.paymentConfirmedAt,
        events: payment.conference?.summaryOfPayments?.map(sop => sop.event) || []
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}