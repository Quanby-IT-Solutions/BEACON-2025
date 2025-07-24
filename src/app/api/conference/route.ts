import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createCheckoutSession, phpToCentavos } from '@/lib/paymongo';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to upload base64 image to Supabase Storage
async function uploadImageToSupabase(base64Image: string, userId: string): Promise<string> {
  try {
    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Generate file name with user ID
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

// Validation schema for conference registration API (aligned with actual Prisma schema)
const conferenceRegistrationSchema = z.object({
  // Form-only fields (for processing, not stored in any model directly)
  selectedEventIds: z.array(z.string()).min(1, 'Please select at least one event'),
  faceScannedUrl: z.string().min(1, 'Face capture is required'),

  // UserDetails fields (matches Prisma UserDetails model)
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional().nullable(),
  suffix: z.string().optional().nullable(),
  preferredName: z.string().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY', 'OTHERS']),
  genderOthers: z.string().optional().nullable(),
  ageBracket: z.enum(['UNDER_18', 'AGE_18_24', 'AGE_25_34', 'AGE_35_44', 'AGE_45_54', 'AGE_55_ABOVE']),
  nationality: z.string().min(1, 'Nationality is required'),

  // UserAccounts fields (matches Prisma UserAccounts model)
  email: z.string().email('Valid email is required'),
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  mailingAddress: z.string().optional().nullable(),

  // Conference model fields (matches actual Prisma Conference model)
  isMaritimeLeagueMember: z.enum(['YES', 'NO', 'APPLY_FOR_MEMBERSHIP']),
  tmlMemberCode: z.string().optional().nullable(),

  // Professional Information (Conference model fields)
  jobTitle: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  companyAddress: z.string().optional().nullable(),
  companyWebsite: z.string().optional().nullable(),

  // Areas of Interest (Conference model fields)
  interestAreas: z.array(z.enum([
    'SHIPBUILDING_SHIP_REPAIR',
    'BOATBUILDING_YACHT_BUILDING',
    'MARINE_TECHNOLOGY',
    'NAVAL_DEFENSE_SECURITY',
    'MARITIME_TOURISM',
    'INNOVATION_SUSTAINABILITY',
    'BLUE_ECONOMY',
    'LIFESTYLE_FASHION',
    'WOMEN_YOUTH_IN_MARITIME',
    'OTHERS'
  ])).min(1, 'Please select at least one interest area'),
  otherInterests: z.string().optional().nullable(),
  receiveEventInvites: z.boolean().default(false),

  // Payment Details (Conference model fields)
  totalPaymentAmount: z.number().optional().nullable(),
  customPaymentAmount: z.string().optional().nullable(),
  paymentMode: z.enum(['BANK_DEPOSIT_TRANSFER', 'GCASH', 'WALK_IN_ON_SITE']).optional().nullable(),

  // Consent & Confirmation (Conference model fields)
  emailCertificate: z.boolean().default(false),
  photoVideoConsent: z.boolean().default(false),
  dataUsageConsent: z.boolean().refine(val => val === true, 'Data usage consent is required'),
});

// POST - Create new conference registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = conferenceRegistrationSchema.parse(body);

    // Separate data for different models
    const {
      selectedEventIds,
      faceScannedUrl,
      // UserDetails fields
      firstName,
      lastName,
      middleName,
      suffix,
      preferredName,
      gender,
      genderOthers,
      ageBracket,
      nationality,
      // UserAccounts fields
      email,
      mobileNumber,
      mailingAddress,
      // Everything else goes to Conference model
      ...conferenceData
    } = validatedData;

    // Validate TML member code if membership is YES
    if (conferenceData.isMaritimeLeagueMember === 'YES') {
      if (!conferenceData.tmlMemberCode || conferenceData.tmlMemberCode.trim().length === 0) {
        return NextResponse.json({
          success: false,
          error: 'TML member code is required when selecting "YES" for Maritime League membership',
        }, { status: 400 });
      }

      // Validate the TML code exists and is active
      const tmlCode = await prisma.codeDistribution.findFirst({
        where: {
          code: conferenceData.tmlMemberCode.trim(),
          isActive: true,
        },
        include: {
          user: {
            include: {
              UserAccounts: true,
              UserDetails: true,
            },
          },
        },
      });

      if (!tmlCode) {
        return NextResponse.json({
          success: false,
          error: 'Invalid TML member code. Please enter a valid code or change your membership selection.',
        }, { status: 400 });
      }

      // Check if code is already used by someone else
      if (tmlCode.userId && tmlCode.user?.UserAccounts?.[0]?.email !== email) {
        return NextResponse.json({
          success: false,
          error: `This TML member code is already in use by ${tmlCode.user?.UserDetails?.[0]?.firstName} ${tmlCode.user?.UserDetails?.[0]?.lastName} (${tmlCode.user?.UserAccounts?.[0]?.email}). Please use your own TML member code.`,
        }, { status: 400 });
      }
    }

    // Check if user already has a registration
    const existingUser = await prisma.user.findFirst({
      where: {
        UserAccounts: {
          some: {
            email: email
          }
        }
      },
      include: {
        UserAccounts: true,
        UserDetails: true,
        Conferences: true
      }
    });

    let user;
    let userAccount;
    let userDetails;

    if (existingUser) {
      user = existingUser;
      userAccount = existingUser.UserAccounts[0];
      userDetails = existingUser.UserDetails[0];

      // Check if user already has a conference registration
      if (existingUser.Conferences.length > 0) {
        return NextResponse.json(
          { error: 'User already has a conference registration' },
          { status: 400 }
        );
      }

      // Update existing user data if needed
      if (userAccount) {
        await prisma.userAccounts.update({
          where: { id: userAccount.id },
          data: {
            email,
            mobileNumber,
            mailingAddress
          }
        });
      }

      if (userDetails) {
        await prisma.userDetails.update({
          where: { id: userDetails.id },
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
      user = await prisma.user.create({
        data: {
          UserAccounts: {
            create: {
              email,
              mobileNumber,
              mailingAddress,
              status: 'ACTIVE'
            }
          },
          UserDetails: {
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
          UserAccounts: true,
          UserDetails: true
        }
      });

      userAccount = user.UserAccounts[0];
      userDetails = user.UserDetails[0];
    }

    // Calculate total payment amount based on selected events
    let calculatedAmount = 0;
    let selectedEvents: any[] = [];

    if (selectedEventIds && selectedEventIds.length > 0) {
      // Fetch selected events from database
      selectedEvents = await prisma.events.findMany({
        where: {
          id: {
            in: selectedEventIds
          },
          isActive: true
        }
      });

      // Calculate total amount from selected events
      calculatedAmount = selectedEvents.reduce((total, event) => {
        return total + Number(event.eventPrice);
      }, 0);

      // Apply conference discount if all 3 CONFERENCE events are selected
      const conferenceEvents = selectedEvents.filter(event => event.eventStatus === 'CONFERENCE');
      if (conferenceEvents.length === 3) {
        // Check if there are exactly 3 CONFERENCE events available in total
        const totalConferenceEvents = await prisma.events.count({
          where: {
            eventStatus: 'CONFERENCE',
            isActive: true
          }
        });

        if (totalConferenceEvents === 3) {
          calculatedAmount -= 1500; // Apply 1500 discount for selecting all 3 conference events
        }
      }
    }

    // Determine if payment is required (non-maritime league members)
    const requiresPayment = conferenceData.isMaritimeLeagueMember === 'NO' && calculatedAmount > 0;

    // Create PayMongo checkout session if payment is required
    let paymongoCheckoutSession: any = null;
    let paymentToken: string | null = null;
    let paymentTokenExpiry: Date | null = null;

    if (requiresPayment && calculatedAmount > 0) {
      try {
        // Create detailed line items for PayMongo
        const lineItems = selectedEvents.map(event => ({
          currency: 'PHP',
          amount: phpToCentavos(Number(event.eventPrice)),
          description: `${event.eventName} - ${event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBD'}`,
          name: event.eventName,
          quantity: 1,
        }));

        // Add discount line item if applicable
        const conferenceEvents = selectedEvents.filter(event => event.eventStatus === 'CONFERENCE');
        if (conferenceEvents.length === 3) {
          const totalConferenceEvents = await prisma.events.count({
            where: {
              eventStatus: 'CONFERENCE',
              isActive: true
            }
          });

          // Don't add negative line items - PayMongo doesn't support them
          // Discount is already applied to calculatedAmount
        }

        // Create PayMongo checkout session with detailed information
        let paymentDescription = `BEACON 2025 Conference Registration - ${firstName} ${lastName}`;
        if (conferenceEvents.length === 3) {
          paymentDescription += ` (₱1,500 Conference Package Discount Applied)`;
        }
        
        const checkoutSessionData = await createCheckoutSession({
          amount: phpToCentavos(calculatedAmount),
          description: paymentDescription,
          line_items: lineItems,
          customer: {
            name: `${firstName} ${lastName}`,
            email: email,
            phone: mobileNumber,
          },
          metadata: {
            conferenceRegistration: true,
            eventCount: selectedEvents.length,
            isMaritimeLeagueMember: conferenceData.isMaritimeLeagueMember,
            email: email,
            firstName: firstName,
            lastName: lastName,
            eventNames: selectedEvents.map(e => e.eventName).join(', '),
          }
        });

        paymongoCheckoutSession = checkoutSessionData;
        
        // Generate fallback payment token for non-PayMongo payments
        paymentToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        paymentTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours for checkout session
      } catch (error) {
        console.error('PayMongo checkout session creation failed:', error);
        // Fallback to manual payment processing
        paymentToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        paymentTokenExpiry = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours for manual payment
      }
    }

    // Create conference registration (only conference-specific fields)
    const conference = await prisma.conference.create({
      data: {
        userId: user.id,
        isMaritimeLeagueMember: conferenceData.isMaritimeLeagueMember,
        tmlMemberCode: conferenceData.tmlMemberCode,
        jobTitle: conferenceData.jobTitle,
        companyName: conferenceData.companyName,
        industry: conferenceData.industry,
        companyAddress: conferenceData.companyAddress,
        companyWebsite: conferenceData.companyWebsite,
        interestAreas: conferenceData.interestAreas,
        otherInterests: conferenceData.otherInterests,
        receiveEventInvites: conferenceData.receiveEventInvites || false,
        totalPaymentAmount: calculatedAmount,
        customPaymentAmount: conferenceData.customPaymentAmount,
        emailCertificate: conferenceData.emailCertificate || false,
        photoVideoConsent: conferenceData.photoVideoConsent || false,
        dataUsageConsent: conferenceData.dataUsageConsent,
        paymentToken,
        paymentTokenExpiry,
        requiresPayment,
      },
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
    });

    // Create summary of payments entries for selected events
    if (selectedEvents.length > 0) {
      const summaryEntries = selectedEvents.map(event => ({
        conferenceId: conference.id,
        eventId: event.id,
        eventName: event.eventName,
        eventDate: event.eventDate,
        eventPrice: event.eventPrice,
        eventStatus: event.eventStatus,
      }));

      await prisma.summaryOfPayments.createMany({
        data: summaryEntries
      });
    }

    // Create payment record if payment is required
    if (requiresPayment && calculatedAmount > 0) {
      const paymentMode = conferenceData.paymentMode || 'GCASH';
      const isWalkInPayment = paymentMode === 'WALK_IN_ON_SITE';
      
      await prisma.conferencePayment.create({
        data: {
          conferenceId: conference.id,
          totalAmount: calculatedAmount,
          paymentMode: paymentMode,
          // Walk-in payments start as PENDING (awaiting on-site payment)
          // Online payments start as PENDING (awaiting PayMongo confirmation)
          paymentStatus: 'PENDING',
          customPaymentAmount: conferenceData.customPaymentAmount,
          
          // PayMongo integration fields (only for online payments)
          paymongoCheckoutId: paymongoCheckoutSession?.id || null,
          paymongoPaymentId: null, // Will be filled by webhook/verification
          paymongoIntentId: paymongoCheckoutSession?.attributes?.payment_intent_id || null,
          paymongoWebhookId: null, // Will be filled by webhook
          paymongoPaymentMethod: null, // Will be filled by webhook
          paymongoReferenceId: null, // Will be filled by webhook
          
          // Payment confirmation
          isPaid: false, // Will be set to true when payment is confirmed
          paymentConfirmedAt: null,
          paymentConfirmedBy: null,
          
          // Notes based on payment type
          notes: isWalkInPayment 
            ? 'Walk-in payment - Awaiting on-site payment confirmation'
            : paymongoCheckoutSession 
              ? 'Online payment - PayMongo checkout session created, awaiting payment confirmation'
              : 'Manual payment processing required',
        }
      });
    }

    // Mark TML code as used if it was provided and valid
    if (conferenceData.isMaritimeLeagueMember === 'YES' && conferenceData.tmlMemberCode) {
      await prisma.codeDistribution.update({
        where: {
          code: conferenceData.tmlMemberCode.trim(),
        },
        data: {
          userId: user.id,
        },
      });
    }

    // Handle face image upload if provided
    let faceImageUrl: string | null = null;
    if (faceScannedUrl) {
      console.log("Conference API: Uploading face image to Supabase");
      try {
        faceImageUrl = await uploadImageToSupabase(faceScannedUrl, user.id);

        // Update UserDetails with the face image URL
        // Use the userDetails variable we already have from user creation/retrieval
        const userDetailsId = userDetails?.id;
        
        if (userDetailsId) {
          await prisma.userDetails.update({
            where: { id: userDetailsId },
            data: {
              faceScannedUrl: faceImageUrl,
            },
          });
        } else {
          console.error("Conference API: UserDetails ID not found for user:", user.id);
        }

        console.log("Conference API: Face image uploaded and URL updated successfully");
      } catch (imageError) {
        console.error("Conference API: Face image upload failed:", imageError);
        // Log the error but don't fail the registration
        // The user registration is already completed
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        conferenceId: conference.id,
        userId: user.id,
        requiresPayment,
        totalAmount: calculatedAmount,
        paymentToken,
        paymentTokenExpiry,
        faceImageUrl: faceImageUrl,
        // PayMongo integration data
        paymongoCheckoutId: paymongoCheckoutSession?.id || null,
        paymongoCheckoutUrl: paymongoCheckoutSession?.attributes?.checkout_url || null,
        paymentMethods: requiresPayment ? ['gcash', 'card', 'paymaya', 'bank_transfer', 'walk_in'] : null,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Conference registration error:', error);

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

// GET - Retrieve conference registrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const conferenceId = searchParams.get('conferenceId');

    if (!userId && !email && !conferenceId) {
      return NextResponse.json(
        { error: 'userId, email, or conferenceId parameter is required' },
        { status: 400 }
      );
    }

    let whereClause: any = {};

    if (conferenceId) {
      whereClause.id = conferenceId;
    } else if (userId) {
      whereClause.userId = userId;
    } else if (email) {
      whereClause.email = email;
    }

    const conferences = await prisma.conference.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            UserAccounts: true,
            UserDetails: true
          }
        },
        ConferencePayment: true,
        summaryOfPayments: {
          include: {
            event: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: conferences
    });

  } catch (error) {
    console.error('Error fetching conference registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update conference registration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { conferenceId, ...updateData } = body;

    if (!conferenceId) {
      return NextResponse.json(
        { error: 'conferenceId is required' },
        { status: 400 }
      );
    }

    // Validate update data with partial schema
    const partialSchema = conferenceRegistrationSchema.partial();
    const validatedData = partialSchema.parse(updateData);

    const updatedConference = await prisma.conference.update({
      where: { id: conferenceId },
      data: validatedData,
      include: {
        user: {
          include: {
            UserAccounts: true,
            UserDetails: true
          }
        },
        ConferencePayment: true,
        summaryOfPayments: {
          include: {
            event: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedConference
    });

  } catch (error) {
    console.error('Error updating conference registration:', error);

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

// DELETE - Remove conference registration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get('conferenceId');

    if (!conferenceId) {
      return NextResponse.json(
        { error: 'conferenceId parameter is required' },
        { status: 400 }
      );
    }

    await prisma.conference.delete({
      where: { id: conferenceId }
    });

    return NextResponse.json({
      success: true,
      message: 'Conference registration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting conference registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}