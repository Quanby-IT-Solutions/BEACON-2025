import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// PayMongo webhook endpoint to handle payment confirmations
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('paymongo-signature');
    
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

// Handle successful payment
async function handlePaymentPaid(eventData: any, attributes: any) {
  try {
    console.log('Processing payment.paid event:', attributes);

    // Get checkout session ID or payment intent ID
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

    // Find the conference payment record by checkout session ID
    let payment = null;
    
    if (checkoutSessionId) {
      payment = await prisma.conferencePayment.findFirst({
        where: {
          paymongoCheckoutId: checkoutSessionId
        }
      });
    }

    // Fallback: try to find by payment intent ID
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

    console.log('Found conference payment:', payment.id);

    // Update payment status to confirmed
    const updatedPayment = await prisma.conferencePayment.update({
      where: { id: payment.id },
      data: {
        isPaid: true,
        paymentStatus: 'CONFIRMED',
        paymentConfirmedAt: new Date(),
        paymentConfirmedBy: 'paymongo_webhook',
        paymongoPaymentId: paymentId || payment.paymongoPaymentId,
        paymongoIntentId: paymentIntentId || payment.paymongoIntentId,
        paymongoWebhookId: eventData.id,
        paymongoPaymentMethod: paymentMethod || payment.paymongoPaymentMethod,
        paymongoReferenceId: referenceNumber || payment.paymongoReferenceId,
        notes: `Payment confirmed via PayMongo webhook - ${eventData.attributes?.type} - ${new Date().toISOString()}`
      }
    });

    console.log('Payment updated successfully:', updatedPayment.id);

    // Optional: Send confirmation email or other notifications here

  } catch (error) {
    console.error('Error handling payment.paid:', error);
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