import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple payment confirmation for test mode
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

    console.log('Test Mode: Confirming payment for checkout session:', checkoutSessionId);

    // Find the payment record by checkout session ID
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
        { success: false, error: 'Payment record not found for this checkout session' },
        { status: 404 }
      );
    }

    // Check if payment is already confirmed
    if (payment.isPaid && payment.paymentStatus === 'CONFIRMED') {
      console.log('Test Mode: Payment already confirmed');
      return NextResponse.json({
        success: true,
        message: 'Payment already confirmed',
        data: {
          conferenceId: payment.conference?.id,
          userId: payment.conference?.userId,
          totalAmount: Number(payment.totalAmount),
          paymentStatus: payment.paymentStatus,
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

    // Update payment status to CONFIRMED and isPaid to true
    const updatedPayment = await prisma.conferencePayment.update({
      where: {
        id: payment.id
      },
      data: {
        paymentStatus: 'CONFIRMED',
        isPaid: true,
        paymentConfirmedAt: new Date(),
        paymentConfirmedBy: 'test_mode_success_page',
        notes: `Test Mode: Payment confirmed via success page at ${new Date().toISOString()}`
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

    console.log('Test Mode: Payment confirmed successfully for conference:', updatedPayment.conference?.id);

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        conferenceId: updatedPayment.conference?.id,
        userId: updatedPayment.conference?.userId,
        totalAmount: Number(updatedPayment.totalAmount),
        paymentStatus: updatedPayment.paymentStatus,
        isPaid: updatedPayment.isPaid,
        paymentConfirmedAt: updatedPayment.paymentConfirmedAt,
        paymentMethod: updatedPayment.paymongoPaymentMethod || 'Test Payment',
        referenceNumber: updatedPayment.paymongoReferenceId || checkoutSessionId,
        participant: {
          name: `${updatedPayment.conference?.user?.UserDetails?.[0]?.firstName} ${updatedPayment.conference?.user?.UserDetails?.[0]?.lastName}`,
          email: updatedPayment.conference?.user?.UserAccounts?.[0]?.email,
        },
        events: updatedPayment.conference?.summaryOfPayments?.map(sop => ({
          id: sop.event.id,
          name: sop.eventName,
          date: sop.eventDate,
          price: Number(sop.eventPrice),
          status: sop.eventStatus
        })) || []
      }
    });

  } catch (error) {
    console.error('Test Mode Payment confirmation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET method for checking payment status
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

    // Find the payment record by checkout session ID
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

    return NextResponse.json({
      success: true,
      data: {
        conferenceId: payment.conference?.id,
        userId: payment.conference?.userId,
        totalAmount: Number(payment.totalAmount),
        paymentStatus: payment.paymentStatus,
        isPaid: payment.isPaid,
        paymentConfirmedAt: payment.paymentConfirmedAt,
        paymentMethod: payment.paymongoPaymentMethod || 'Online Payment',
        referenceNumber: payment.paymongoReferenceId || checkoutSessionId,
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