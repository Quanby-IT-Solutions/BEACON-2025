import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Admin endpoint to manually confirm walk-in payments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, transactionId, notes, adminId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Find the payment record
    const payment = await prisma.conferencePayment.findUnique({
      where: { id: paymentId },
      include: {
        conference: {
          include: {
            user: {
              include: {
                user_accounts: true,
                user_details: true
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

    // Check if payment is already confirmed
    if (payment.isPaid) {
      return NextResponse.json(
        { success: false, error: 'Payment is already confirmed' },
        { status: 400 }
      );
    }

    // Update payment status to confirmed
    const updatedPayment = await prisma.conferencePayment.update({
      where: { id: paymentId },
      data: {
        isPaid: true,
        paymentStatus: 'CONFIRMED',
        paymentDate: new Date(),
        paymentConfirmedAt: new Date(),
        paymentConfirmedBy: `admin_${adminId || 'unknown'}`,
        transactionId: transactionId || null,
        notes: notes || `Walk-in payment manually confirmed by admin at ${new Date().toISOString()}`,
      }
    });

    console.log('Walk-in payment confirmed by admin:', updatedPayment.id);

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        paymentId: updatedPayment.id,
        conferenceId: updatedPayment.conferenceId,
        totalAmount: Number(updatedPayment.totalAmount),
        paymentMode: updatedPayment.paymentMode,
        paymentStatus: updatedPayment.paymentStatus,
        isPaid: updatedPayment.isPaid,
        paymentConfirmedAt: updatedPayment.paymentConfirmedAt,
        transactionId: updatedPayment.transactionId,
        participant: {
          name: `${payment.conference?.user?.user_details?.[0]?.firstName} ${payment.conference?.user?.user_details?.[0]?.lastName}`,
          email: payment.conference?.user?.user_accounts?.[0]?.email,
        }
      }
    });

  } catch (error) {
    console.error('Admin payment confirmation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - List pending payments for admin review
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const paymentMode = searchParams.get('paymentMode');

    let whereClause: any = {
      paymentStatus: status
    };

    if (paymentMode) {
      whereClause.paymentMode = paymentMode;
    }

    const payments = await prisma.conferencePayment.findMany({
      where: whereClause,
      include: {
        conference: {
          include: {
            user: {
              include: {
                user_accounts: true,
                user_details: true
              }
            },
            summaryOfPayments: {
              include: {
                event: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      conferenceId: payment.conferenceId,
      totalAmount: Number(payment.totalAmount),
      paymentMode: payment.paymentMode,
      paymentStatus: payment.paymentStatus,
      isPaid: payment.isPaid,
      createdAt: payment.createdAt,
      paymentConfirmedAt: payment.paymentConfirmedAt,
      transactionId: payment.transactionId,
      notes: payment.notes,
      participant: {
        name: `${payment.conference?.user?.user_details?.[0]?.firstName} ${payment.conference?.user?.user_details?.[0]?.lastName}`,
        email: payment.conference?.user?.user_accounts?.[0]?.email,
        phone: payment.conference?.user?.user_accounts?.[0]?.mobileNumber,
      },
      events: payment.conference?.summaryOfPayments?.map(sop => ({
        name: sop.eventName,
        date: sop.eventDate,
        price: Number(sop.eventPrice),
        status: sop.eventStatus
      })) || []
    }));

    return NextResponse.json({
      success: true,
      data: formattedPayments,
      count: formattedPayments.length
    });

  } catch (error) {
    console.error('Error fetching payments for admin:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}