import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { AgeBracket, AttendeeType, EventDay, Gender, HearAboutEvent, Industry, InterestArea, PrismaClient } from '@prisma/client';
import { baseVisitorSchema } from '@/types/visitor/registration';


const prisma = new PrismaClient();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);



// Schema with conditional validation
const visitorRegistrationSchema = baseVisitorSchema.refine((data) => {
  // If attendee type is STUDENT_ACADEMIC, professional info is optional
  if (data.attendeeType === AttendeeType.STUDENT_ACADEMIC) {
    return true; // All professional fields are optional for students
  }

  // For non-students, require professional information
  return (
    data.jobTitle &&
    data.companyName &&
    data.industry
  );
}, {
  message: "Professional information is required for non-student attendees",
  path: ["jobTitle"], // This will show the error on jobTitle field
});

// Helper function to upload base64 image to Supabase Storage
async function uploadImageToSupabase(base64Image: string, userId: string): Promise<string> {
  try {
    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Generate file name with user ID directory structure
    const fileName = `${userId}/face-scan.jpg`;
    const filePath = `user-profile/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('user-profile')
      .upload(filePath, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true // This will replace if file already exists
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('user-profile')
      .getPublicUrl(filePath);

    return publicData.publicUrl;

  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("API: Received registration request");
    const body = await request.json();
    console.log("API: Request body:", body);

    // Validate the request body
    console.log("API: Validating request data");
    const validatedData = visitorRegistrationSchema.parse(body);
    console.log("API: Validation successful");

    // Create user and related records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {},
      });

      // Create UserAccounts
      const userAccount = await tx.userAccounts.create({
        data: {
          userId: user.id,
          email: validatedData.email,
          mobileNumber: validatedData.mobileNumber,
          landline: validatedData.landline || null,
          status: 'VISITOR',
        },
      });

      // Create UserDetails (initially without faceScannedUrl)
      const userDetails = await tx.userDetails.create({
        data: {
          userId: user.id,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          middleName: validatedData.middleName || null,
          suffix: validatedData.suffix || null,
          preferredName: validatedData.preferredName || null,
          gender: validatedData.gender,
          genderOthers: validatedData.genderOthers || null,
          ageBracket: validatedData.ageBracket,
          nationality: validatedData.nationality,
          faceScannedUrl: null, // Initially null
        },
      });

      // Create Visitors record
      const visitor = await tx.visitors.create({
        data: {
          userId: user.id,
          jobTitle: validatedData.jobTitle || '',
          companyName: validatedData.companyName || '',
          industry: validatedData.industry || Industry.OTHERS,
          industryOthers: validatedData.industryOthers || null,
          companyAddress: validatedData.companyAddress || null,
          companyWebsite: validatedData.companyWebsite || null,
          businessEmail: validatedData.businessEmail || null,
          attendingDays: validatedData.attendingDays,
          eventParts: validatedData.eventParts,
          attendeeType: validatedData.attendeeType,
          interestAreas: validatedData.interestAreas,
          receiveUpdates: validatedData.receiveUpdates,
          inviteToFutureEvents: validatedData.inviteToFutureEvents,
          specialAssistance: validatedData.specialAssistance || null,
          emergencyContactPerson: validatedData.emergencyContactPerson,
          emergencyContactNumber: validatedData.emergencyContactNumber,
          dataPrivacyConsent: validatedData.dataPrivacyConsent,
          hearAboutEvent: validatedData.hearAboutEvent,
          hearAboutOthers: validatedData.hearAboutOthers || null,
        },
      });

      return {
        user,
        userAccount,
        userDetails,
        visitor,
      };
    });

    // After successful transaction, handle face image upload if provided
    let faceImageUrl: string | null = null;
    if (validatedData.faceScannedUrl) {
      console.log("API: Uploading face image to Supabase");
      try {
        faceImageUrl = await uploadImageToSupabase(validatedData.faceScannedUrl, result.user.id);

        // Update UserDetails with the face image URL
        await prisma.userDetails.update({
          where: { id: result.userDetails.id }, // use the id from the create result
          data: {
            faceScannedUrl: faceImageUrl,
          },
        });


        console.log("API: Face image uploaded and URL updated successfully");
      } catch (imageError) {
        console.error("API: Face image upload failed:", imageError);
        // Log the error but don't fail the registration
        // The user registration is already completed
      }
    }

    return NextResponse.json({
      success: true,
      message: "Visitor registration completed successfully",
      data: {
        userId: result.user.id,
        visitorId: result.visitor.id,
        faceImageUrl: faceImageUrl,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('API: Visitor registration error:', error);

    if (error instanceof z.ZodError) {
      console.error('API: Validation error details:', error);
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: error,
      }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      console.error('API: Unique constraint error');
      return NextResponse.json({
        success: false,
        message: "Email already exists",
      }, { status: 409 });
    }

    if (error instanceof Error) {
      console.error('API: General error:', error.message);
      return NextResponse.json({
        success: false,
        message: error.message,
      }, { status: 500 });
    }

    console.error('API: Unknown error type');
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 });
  }
}