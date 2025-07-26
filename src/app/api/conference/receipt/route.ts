import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to upload base64 image to Supabase Storage
async function uploadReceiptToSupabase(receiptFile: File, userId: string): Promise<string> {
  try {
    // Generate file name with user ID and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = receiptFile.name.split('.').pop() || 'jpg';
    const fileName = `${userId}/receipt-${timestamp}.${fileExtension}`;
    const filePath = fileName;

    // Upload to Supabase Storage - 'receipt' bucket  
    const { data, error } = await supabase.storage
      .from('receipt')
      .upload(filePath, receiptFile, {
        contentType: receiptFile.type,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Supabase receipt upload error:', error);
      throw new Error(`Failed to upload receipt: ${error.message}`);
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('receipt')
      .getPublicUrl(filePath);

    return publicData.publicUrl;

  } catch (error) {
    console.error('Receipt upload error:', error);
    throw error;
  }
}

// POST - Upload receipt for existing conference registration
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const receiptFile = formData.get('receiptFile') as File | null;
    const conferenceId = formData.get('conferenceId') as string;

    if (!receiptFile) {
      return NextResponse.json({
        success: false,
        error: 'No receipt file provided'
      }, { status: 400 });
    }

    if (!conferenceId) {
      return NextResponse.json({
        success: false,
        error: 'Conference ID is required'
      }, { status: 400 });
    }

    console.log('Receipt upload request:', {
      conferenceId,
      fileName: receiptFile.name,
      fileSize: receiptFile.size,
      fileType: receiptFile.type
    });

    // Find the conference registration
    const conference = await prisma.conference.findUnique({
      where: { id: conferenceId },
      include: {
        user: true,
        ConferencePayment: true
      }
    });

    if (!conference) {
      return NextResponse.json({
        success: false,
        error: 'Conference registration not found'
      }, { status: 404 });
    }

    if (!conference.ConferencePayment) {
      return NextResponse.json({
        success: false,
        error: 'No payment record found for this registration'
      }, { status: 404 });
    }

    // Upload receipt to Supabase
    console.log("Uploading receipt to Supabase");
    const receiptImageUrl = await uploadReceiptToSupabase(receiptFile, conference.userId);

    // Update payment record with receipt URL
    await prisma.conferencePayment.update({
      where: { id: conference.ConferencePayment.id },
      data: {
        receiptImageUrl: receiptImageUrl,
        paymentStatus: 'PENDING', // Keep as PENDING until admin verifies
        notes: 'Receipt uploaded - Awaiting admin verification',
        updatedAt: new Date()
      }
    });

    console.log("Receipt uploaded successfully:", receiptImageUrl);

    return NextResponse.json({
      success: true,
      message: 'Receipt uploaded successfully',
      data: {
        receiptImageUrl,
        paymentStatus: 'PENDING'
      }
    });

  } catch (error) {
    console.error('Receipt upload error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload receipt'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}