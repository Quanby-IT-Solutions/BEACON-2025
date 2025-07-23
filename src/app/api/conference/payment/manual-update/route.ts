import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCheckoutSession } from '@/lib/paymongo';

const prisma = new PrismaClient();

// Manual endpoint to update payment status for testing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkoutSessionId } = body;

    if (!checkoutSessionId) {
      return NextResponse.json(
        { success: false, error: 'Checkout session ID is required' },
        { status: 400 }
      );
    }

    console.log('Manual payment update for checkout session:', checkoutSessionId);

    // Find the payment record
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
        { success: false, error: 'Payment record not found' },
        { status: 404 }
      );
    }

    console.log('Found payment record:', payment.id);

    // Get checkout session details from PayMongo
    let checkoutSession;
    try {
      checkoutSession = await getCheckoutSession(checkoutSessionId);
      console.log('PayMongo checkout session:', JSON.stringify(checkoutSession, null, 2));
    } catch (error) {
      console.error('Failed to get checkout session from PayMongo:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to get checkout session from PayMongo' },
        { status: 500 }
      );
    }

    const paymentStatus = checkoutSession.attributes.payment_status;
    const payments = checkoutSession.attributes.payments || [];
    
    console.log('Payment status:', paymentStatus);
    console.log('Payments array:', payments);

    if (paymentStatus === 'paid' && payments.length > 0) {
      const paymentData = payments[0].attributes;
      
      // Update payment record
      const updatedPayment = await prisma.conferencePayment.update({
        where: { id: payment.id },
        data: {
          isPaid: true,
          paymentStatus: 'CONFIRMED',
          paymentConfirmedAt: new Date(),
          paymentConfirmedBy: 'manual_update',
          paymongoPaymentId: payments[0].id,
          paymongoPaymentMethod: paymentData.payment_method_type,
          paymongoReferenceId: paymentData.reference_number,
          notes: `Payment manually confirmed - PayMongo status: ${paymentStatus} - ${new Date().toISOString()}`
        }
      });

      console.log('Payment updated successfully:', updatedPayment.id);

      return NextResponse.json({
        success: true,
        message: 'Payment status updated successfully',
        data: {
          paymentId: updatedPayment.id,
          isPaid: updatedPayment.isPaid,
          paymentStatus: updatedPayment.paymentStatus,
          paymentMethod: updatedPayment.paymongoPaymentMethod,
          referenceNumber: updatedPayment.paymongoReferenceId,
          confirmedAt: updatedPayment.paymentConfirmedAt,
          paymongoData: {
            status: paymentStatus,
            paymentId: payments[0].id,
            paymentMethod: paymentData.payment_method_type,
            amount: paymentData.amount,
            currency: paymentData.currency
          }
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `Payment not completed. Status: ${paymentStatus}`,
        data: {
          paymentStatus,
          hasPayments: payments.length > 0,
          checkoutSessionId
        }
      });
    }

  } catch (error) {
    console.error('Manual payment update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}