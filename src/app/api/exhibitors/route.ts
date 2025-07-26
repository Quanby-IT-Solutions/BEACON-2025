import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to upload base64 image to Supabase Storage
async function uploadImageToSupabase(base64Image: string, userId: string, type: 'face'): Promise<string> {
  try {
    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Generate file name with uid structure
    const fileName = `face-scan.jpg`;
    const filePath = `${userId}/${fileName}`;

    // Upload to user-profile bucket
    const { data, error } = await supabase.storage
      .from('user-profile')
      .upload(filePath, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true // This will replace if file already exists
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload ${type} image: ${error.message}`);
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('user-profile')
      .getPublicUrl(filePath);

    return publicData.publicUrl;

  } catch (error) {
    console.error(`${type} image upload error:`, error);
    throw error;
  }
}

// Helper function to upload file to Supabase Storage
async function uploadFileToSupabase(file: File, userId: string, type: 'logo' | 'letter'): Promise<string> {
  try {
    // Allowed extensions for logo and letter
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];

    // Extract and normalize file extension
    let fileExtension = file.name.split('.').pop()?.toLowerCase();

    // Fallback if no extension or not allowed
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      fileExtension = type === 'logo' ? 'jpg' : 'pdf';
    }

    // Clean original file name and append extension
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = file.name.replace(/\s+/g, '_').replace(/\.[^/.]+$/, ''); // remove original extension
    const fileName = `${type}-${timestamp}-${baseName}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    // Choose correct bucket
    const bucketName = type === 'logo' ? 'company-logos' : 'documents';

    // Upload file to Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Supabase file upload error:', error);
      throw new Error(`Failed to upload ${type}: ${error.message}`);
    }

    // Get the public URL
    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicData.publicUrl;

  } catch (error) {
    console.error(`${type} file upload error:`, error);
    throw error;
  }
}


// Validation schema for exhibitor registration API (aligned with Prisma schema)
const exhibitorRegistrationSchema = z.object({
  // Form-only fields (for processing, not stored in any model directly)
  faceScannedUrl: z.string().min(1, 'Face capture is required'),

  // user_details fields (matches Prisma user_details model)
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional().nullable(),
  suffix: z.string().optional().nullable(),
  preferredName: z.string().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY', 'OTHERS']),
  genderOthers: z.string().optional().nullable(),
  ageBracket: z.enum(['UNDER_18', 'AGE_18_24', 'AGE_25_34', 'AGE_35_44', 'AGE_45_54', 'AGE_55_ABOVE']),
  nationality: z.string().min(1, 'Nationality is required'),

  // user_accounts fields (matches Prisma user_accounts model)
  email: z.string().email('Valid email is required'),
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  mailingAddress: z.string().optional().nullable(),
  landline: z.string().optional().nullable(),

  // exhibitor_registrations fields - Company Information
  companyName: z.string().min(1, 'Company name is required'),
  businessRegistrationName: z.string().optional().nullable(),
  industrySector: z.enum([
    'SHIPBUILDING_BOATBUILDING',
    'MARITIME_EQUIPMENT_TECHNOLOGY',
    'NAVAL_DEFENSE',
    'PORT_LOGISTICS',
    'MARINE_TOURISM',
    'RENEWABLE_GREEN',
    'FASHION_LIFESTYLE',
    'EDUCATION_TRAINING',
    'OTHERS'
  ]),
  industrySectorOthers: z.string().optional().nullable(),
  companyAddress: z.string().optional().nullable(),
  companyWebsite: z.string().optional().nullable(),
  companyProfile: z.string().optional().nullable(),

  // Exhibition Package & Preferences
  participationTypes: z.array(z.enum([
    'INDOOR_BOOTH',
    'RAW_SPACE',
    'IN_WATER_DISPLAY',
    'BLUE_RUNWAY',
    'PRODUCT_LAUNCH',
    'CO_BRANDING'
  ])).min(1, 'Please select at least one participation type'),
  boothSize: z.enum([
    'SIZE_2X2',
    'SIZE_2X3',
    'SIZE_3X3',
    'SIZE_6X3',
    'RAW_SPACE_MIN_18',
    'CUSTOM_SETUP'
  ]).optional().nullable(),
  boothDescription: z.string().min(1, 'Booth description is required'),
  launchNewProduct: z.enum(['YES', 'NO', 'MAYBE']).optional().nullable(),
  requireDemoArea: z.enum(['YES', 'NO', 'MAYBE']).optional().nullable(),

  // Logistics & Marketing Coordination
  bringLargeEquipment: z.enum(['YES', 'NO', 'MAYBE']).optional().nullable(),
  haveMarketingCollaterals: z.string().optional().nullable(),

  // Company Objectives & Collaboration
  goals: z.array(z.enum([
    'SHOWCASE_PRODUCTS',
    'MEET_BUYERS',
    'PROMOTE_BRAND',
    'LAUNCH_NEW_PRODUCT',
    'ENGAGE_GOV_AGENCIES',
    'JOIN_BLUE_ECONOMY',
    'RECRUIT_TALENT',
    'OTHERS'
  ])).min(1, 'Please select at least one goal'),
  goalsOthers: z.string().optional().nullable(),
  exploreSponsorship: z.enum(['YES', 'NO', 'MAYBE']).optional().nullable(),

  // Confirmation & Next Steps
  confirmIntent: z.enum(['YES_RESERVE', 'TENTATIVE', 'NO_EXPLORING']),
  additionalComments: z.string().optional().nullable(),
});

// POST - Create new exhibitor registration
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract files if present
    const logoFile = formData.get('logoFile') as File | null;
    const letterOfIntentFile = formData.get('letterOfIntentFile') as File | null;

    // Extract other form data
    const jsonData: any = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'logoFile' && key !== 'letterOfIntentFile') {
        jsonData[key] = value;
      }
    }

    console.log('Raw FormData entries:', Object.fromEntries(formData.entries()));
    console.log('Parsed jsonData before processing:', jsonData);

    // Parse JSON fields that come as strings from FormData
    try {
      if (jsonData.participationTypes && typeof jsonData.participationTypes === 'string') {
        jsonData.participationTypes = JSON.parse(jsonData.participationTypes);
      }
      if (jsonData.goals && typeof jsonData.goals === 'string') {
        jsonData.goals = JSON.parse(jsonData.goals);
      }

      // Convert string booleans to actual booleans (if any)
      // Note: exhibitor registration doesn't have boolean fields, but keeping for consistency

    } catch (parseError) {
      console.error('Error parsing FormData fields:', parseError);
      throw new Error('Invalid form data format');
    }

    console.log('Processed jsonData before validation:', jsonData);

    const validatedData = exhibitorRegistrationSchema.parse(jsonData);

    // Separate data for different models
    const {
      faceScannedUrl,
      // user_details fields
      firstName,
      lastName,
      middleName,
      suffix,
      preferredName,
      gender,
      genderOthers,
      ageBracket,
      nationality,
      // user_accounts fields
      email,
      mobileNumber,
      mailingAddress,
      landline,
      // Everything else goes to exhibitor_registrations model
      ...exhibitorData
    } = validatedData;

    // Additional validations
    if (exhibitorData.industrySector === 'OTHERS') {
      if (!exhibitorData.industrySectorOthers || exhibitorData.industrySectorOthers.trim().length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Please specify your industry sector when selecting "Others"',
        }, { status: 400 });
      }
    }

    if (gender === 'OTHERS') {
      if (!genderOthers || genderOthers.trim().length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Please specify your gender when selecting "Others"',
        }, { status: 400 });
      }
    }

    if (exhibitorData.goals.includes('OTHERS')) {
      if (!exhibitorData.goalsOthers || exhibitorData.goalsOthers.trim().length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Please specify your other goals when selecting "Others"',
        }, { status: 400 });
      }
    }

    // Check if user already has an exhibitor registration
    const existingUser = await prisma.users.findFirst({
      where: {
        user_accounts: {
          some: {
            email: email
          }
        }
      },
      include: {
        user_accounts: true,
        user_details: true,
        ExhibitorRegistrations: true
      }
    });

    let user;
    let userAccount;
    let user_details;

    if (existingUser) {
      user = existingUser;
      userAccount = existingUser.user_accounts[0];
      user_details = existingUser.user_details[0];

      // Check if user already has an exhibitor registration
      if (existingUser.ExhibitorRegistrations.length > 0) {
        return NextResponse.json(
          { error: 'User already has an exhibitor registration' },
          { status: 400 }
        );
      }

      // Update existing user data if needed
      if (userAccount) {
        await prisma.user_accounts.update({
          where: { id: userAccount.id },
          data: {
            email,
            mobileNumber,
            mailingAddress,
            landline
          }
        });
      }

      if (user_details) {
        await prisma.user_details.update({
          where: { id: user_details.id },
          data: {
            firstName,
            lastName,
            middleName,
            suffix,
            preferredName,
            gender,
            genderOthers,
            ageBracket,
            nationality,
            faceScannedUrl: null // Will be updated after image upload
          }
        });
      }
    } else {
      // Create new user with accounts and details
      user = await prisma.users.create({
        data: {
          user_accounts: {
            create: {
              email,
              mobileNumber,
              mailingAddress,
              landline,
              status: 'ACTIVE'
            }
          },
          user_details: {
            create: {
              firstName,
              lastName,
              middleName,
              suffix,
              preferredName,
              gender,
              genderOthers,
              ageBracket,
              nationality,
              faceScannedUrl: null // Will be updated after image upload
            }
          }
        },
        include: {
          user_accounts: true,
          user_details: true
        }
      });

      userAccount = user.user_accounts[0];
      user_details = user.user_details[0];
    }

    // Step 1: Create exhibitor registration with null/empty file URLs
    console.log("Exhibitor API: Creating exhibitor registration with null file URLs");
    const exhibitor = await prisma.exhibitor_registrations.create({
      data: {
        userId: user.id,
        companyName: exhibitorData.companyName,
        businessRegistrationName: exhibitorData.businessRegistrationName,
        industrySector: exhibitorData.industrySector,
        industrySectorOthers: exhibitorData.industrySectorOthers,
        companyAddress: exhibitorData.companyAddress,
        companyWebsite: exhibitorData.companyWebsite,
        companyProfile: exhibitorData.companyProfile,
        participationTypes: exhibitorData.participationTypes,
        boothSize: exhibitorData.boothSize,
        boothDescription: exhibitorData.boothDescription,
        launchNewProduct: exhibitorData.launchNewProduct,
        requireDemoArea: exhibitorData.requireDemoArea,
        bringLargeEquipment: exhibitorData.bringLargeEquipment,
        haveMarketingCollaterals: exhibitorData.haveMarketingCollaterals,
        logoUrl: null, // Initially null, will be updated after upload
        goals: exhibitorData.goals,
        goalsOthers: exhibitorData.goalsOthers,
        exploreSponsorship: exhibitorData.exploreSponsorship,
        confirmIntent: exhibitorData.confirmIntent,
        letterOfIntentUrl: null, // Initially null, will be updated after upload
        additionalComments: exhibitorData.additionalComments,
      },
      include: {
        user: {
          include: {
            user_accounts: true,
            user_details: true
          }
        }
      }
    });

    console.log("Exhibitor API: Registration created successfully with ID:", exhibitor.id);

    // Step 2: Handle file uploads after record creation
    let faceImageUrl: string | null = null;
    let logoImageUrl: string | null = null;
    let letterOfIntentUrl: string | null = null;

    // Handle face image upload if provided
    if (faceScannedUrl) {
      console.log("Exhibitor API: Uploading face image to user-profile/" + user.id + "/");
      try {
        faceImageUrl = await uploadImageToSupabase(faceScannedUrl, user.id, 'face');

        // Update user_details with the face image URL
        const user_detailsId = user_details?.id;

        if (user_detailsId) {
          await prisma.user_details.update({
            where: { id: user_detailsId },
            data: {
              faceScannedUrl: faceImageUrl,
            },
          });
        } else {
          console.error("Exhibitor API: user_details ID not found for user:", user.id);
        }

        console.log("Exhibitor API: Face image uploaded and URL updated successfully");
      } catch (imageError) {
        console.error("Exhibitor API: Face image upload failed:", imageError);
        // Log the error but don't fail the registration
      }
    }

    // Handle logo file upload if provided
    if (logoFile) {
      console.log("Exhibitor API: Uploading logo file to company-logos/" + user.id + "/");
      try {
        logoImageUrl = await uploadFileToSupabase(logoFile, user.id, 'logo');

        // Update exhibitor registration with logo URL
        await prisma.exhibitor_registrations.update({
          where: { id: exhibitor.id },
          data: {
            logoUrl: logoImageUrl,
          }
        });

        console.log("Exhibitor API: Logo file uploaded successfully to:", logoImageUrl);
      } catch (logoError) {
        console.error("Exhibitor API: Logo file upload failed:", logoError);
        // Log the error but don't fail the registration
      }
    }

    // Handle letter of intent file upload if provided
    if (letterOfIntentFile) {
      console.log("Exhibitor API: Uploading letter of intent file to documents/" + user.id + "/");
      try {
        letterOfIntentUrl = await uploadFileToSupabase(letterOfIntentFile, user.id, 'letter');

        // Update exhibitor registration with letter URL
        await prisma.exhibitor_registrations.update({
          where: { id: exhibitor.id },
          data: {
            letterOfIntentUrl: letterOfIntentUrl,
          }
        });

        console.log("Exhibitor API: Letter of intent file uploaded successfully to:", letterOfIntentUrl);
      } catch (letterError) {
        console.error("Exhibitor API: Letter of intent file upload failed:", letterError);
        // Log the error but don't fail the registration
      }
    }

    console.log("Exhibitor API: File upload process completed");
    console.log("Final URLs - Face:", faceImageUrl, "Logo:", logoImageUrl, "Letter:", letterOfIntentUrl);

    return NextResponse.json({
      success: true,
      data: {
        exhibitorId: exhibitor.id,
        userId: user.id,
        faceImageUrl: faceImageUrl,
        logoUrl: logoImageUrl,
        letterOfIntentUrl: letterOfIntentUrl,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Exhibitor registration error:', error);

    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.issues);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
          message: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Retrieve exhibitor registrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const exhibitorId = searchParams.get('exhibitorId');

    if (!userId && !email && !exhibitorId) {
      return NextResponse.json(
        { error: 'userId, email, or exhibitorId parameter is required' },
        { status: 400 }
      );
    }

    let whereClause: any = {};

    if (exhibitorId) {
      whereClause.id = exhibitorId;
    } else if (userId) {
      whereClause.userId = userId;
    } else if (email) {
      whereClause.user = {
        user_accounts: {
          some: {
            email: email
          }
        }
      };
    }

    const exhibitors = await prisma.exhibitor_registrations.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            user_accounts: true,
            user_details: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: exhibitors
    });

  } catch (error) {
    console.error('Error fetching exhibitor registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update exhibitor registration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { exhibitorId, ...updateData } = body;

    if (!exhibitorId) {
      return NextResponse.json(
        { error: 'exhibitorId is required' },
        { status: 400 }
      );
    }

    // Validate update data with partial schema
    const partialSchema = exhibitorRegistrationSchema.partial();
    const validatedData = partialSchema.parse(updateData);

    const updatedExhibitor = await prisma.exhibitor_registrations.update({
      where: { id: exhibitorId },
      data: validatedData,
      include: {
        user: {
          include: {
            user_accounts: true,
            user_details: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedExhibitor
    });

  } catch (error) {
    console.error('Error updating exhibitor registration:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Remove exhibitor registration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exhibitorId = searchParams.get('exhibitorId');

    if (!exhibitorId) {
      return NextResponse.json(
        { error: 'exhibitorId parameter is required' },
        { status: 400 }
      );
    }

    await prisma.exhibitor_registrations.delete({
      where: { id: exhibitorId }
    });

    return NextResponse.json({
      success: true,
      message: 'Exhibitor registration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting exhibitor registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}