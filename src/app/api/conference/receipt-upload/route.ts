import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to upload file to Supabase Storage
async function uploadReceiptToSupabase(file: File, userId: string): Promise<string> {
  try {
    // Generate file name with user ID and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}/receipt-${timestamp}.${fileExtension}`;
    const filePath = fileName;

    // Upload to Supabase Storage - 'receipts' bucket
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true // This will replace if file already exists
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload receipt: ${error.message}`);
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    return publicData.publicUrl;

  } catch (error) {
    console.error('Receipt upload error:', error);
    throw error;
  }
}

// POST - Upload receipt file and update payment record
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const conferenceId = formData.get('conferenceId') as string;
    const receiptFile = formData.get('receiptFile') as File;
    const referenceNumber = formData.get('referenceNumber') as string | null;

    if (!conferenceId || !receiptFile) {
      return NextResponse.json(
        { error: 'conferenceId and receiptFile are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!receiptFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (receiptFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Find the conference and its payment record
    const conference = await prisma.conference.findUnique({
      where: { id: conferenceId },
      include: {
        ConferencePayment: true,
        user: {
          include: {
            user_accounts: true,
            user_details: true
          }
        }
      }
    });

    if (!conference) {
      return NextResponse.json(
        { error: 'Conference registration not found' },
        { status: 404 }
      );
    }

    if (!conference.ConferencePayment) {
      return NextResponse.json(
        { error: 'No payment record found for this registration' },
        { status: 404 }
      );
    }

    // Upload receipt to Supabase
    const receiptUrl = await uploadReceiptToSupabase(receiptFile, conference.userId);

    // Update payment record with receipt URL and reference number
    const updatedPayment = await prisma.conferencePayment.update({
      where: { conferenceId: conference.id },
      data: {
        receiptImageUrl: receiptUrl,
        referenceNumber: referenceNumber || null,
        paymentStatus: 'CONFIRMED', // Mark as confirmed when receipt is uploaded
        notes: `Receipt uploaded on ${new Date().toISOString()}. Awaiting admin verification.`,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        receiptUrl: receiptUrl,
        paymentId: updatedPayment.id,
        conferenceId: conference.id,
        message: 'Receipt uploaded successfully. Your payment is now under review.'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Receipt upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload receipt' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Get receipt information for a conference
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get('conferenceId');

    if (!conferenceId) {
      return NextResponse.json(
        { error: 'conferenceId parameter is required' },
        { status: 400 }
      );
    }

    const payment = await prisma.conferencePayment.findUnique({
      where: { conferenceId: conferenceId },
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
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        receiptImageUrl: payment.receiptImageUrl,
        referenceNumber: payment.referenceNumber,
        paymentStatus: payment.paymentStatus,
        totalAmount: payment.totalAmount,
        paymentMode: payment.paymentMode,
        notes: payment.notes,
        uploadedAt: payment.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching receipt information:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}