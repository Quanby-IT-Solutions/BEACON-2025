import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCheckoutSession } from '@/lib/paymongo';

const prisma = new PrismaClient();

// Manual payment verification endpoint for testing
export async function POST(request: NextRequest) {
  try {
    const { checkoutSessionId } = await request.json();

    if (!checkoutSessionId) {
      return NextResponse.json(
        { success: false, error: 'Checkout session ID is required' },
        { status: 400 }
      );
    }

    console.log('Manually verifying payment for checkout session:', checkoutSessionId);

    // Find the payment record
    const payment = await prisma.conferencePayment.findFirst({
      where: {
        paymongoCheckoutId: checkoutSessionId
      },
      include: {
        conference: true
      }
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Get checkout session from PayMongo
    try {
      const checkoutSession = await getCheckoutSession(checkoutSessionId);
      console.log('PayMongo checkout session:', checkoutSession);

      const paymentStatus = checkoutSession.attributes.payment_status;
      const payments = checkoutSession.attributes.payments || [];

      console.log('Payment status:', paymentStatus);
      console.log('Payments:', payments);

      // Check if payment was successful
      if (paymentStatus === 'paid' && payments.length > 0) {
        const payment_data = payments[0];
        
        // Update payment status
        const updatedPayment = await prisma.conferencePayment.update({
          where: { id: payment.id },
          data: {
            isPaid: true,
            paymentStatus: 'CONFIRMED',
            paymentConfirmedAt: new Date(),
            paymentConfirmedBy: 'manual_verification',
            paymongoPaymentId: payment_data.id,
            paymongoPaymentMethod: payment_data.attributes?.payment_method_type,
            paymongoReferenceId: payment_data.attributes?.reference_number,
            notes: `Payment manually verified - ${new Date().toISOString()}`
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Payment confirmed successfully',
          data: {
            paymentId: updatedPayment.id,
            conferenceId: payment.conferenceId,
            amount: Number(updatedPayment.totalAmount),
            status: updatedPayment.paymentStatus,
            confirmedAt: updatedPayment.paymentConfirmedAt
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Payment not completed or failed',
          paymentStatus,
          checkoutSession: checkoutSession.attributes
        });
      }

    } catch (paymongoError) {
      console.error('PayMongo API error:', paymongoError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify with PayMongo API' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Manual verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint to check payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutSessionId = searchParams.get('checkout_session_id');

    if (!checkoutSessionId) {
      return NextResponse.json(
        { success: false, error: 'checkout_session_id parameter is required' },
        { status: 400 }
      );
    }

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
            }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        conferenceId: payment.conferenceId,
        checkoutSessionId: payment.paymongoCheckoutId,
        paymentStatus: payment.paymentStatus,
        isPaid: payment.isPaid,
        totalAmount: Number(payment.totalAmount),
        paymentMethod: payment.paymongoPaymentMethod,
        referenceNumber: payment.paymongoReferenceId,
        confirmedAt: payment.paymentConfirmedAt,
        confirmedBy: payment.paymentConfirmedBy,
        email: payment.conference?.user?.UserAccounts?.[0]?.email,
        name: `${payment.conference?.user?.UserDetails?.[0]?.firstName} ${payment.conference?.user?.UserDetails?.[0]?.lastName}`
      }
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}