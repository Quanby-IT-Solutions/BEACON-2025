import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';
import { AgeBracket, Gender, Industry, EventDay, AttendeeType, InterestArea, HearAboutEvent } from '@/generated/prisma';

const prisma = new PrismaClient();

// Base schema without conditional validation
const baseVisitorSchema = z.object({
  // Personal Information (UserDetails)
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional().nullable(),
  suffix: z.string().optional().nullable(),
  preferredName: z.string().optional().nullable(),
  gender: z.nativeEnum(Gender),
  genderOthers: z.string().optional().nullable(),
  ageBracket: z.nativeEnum(AgeBracket),
  nationality: z.string().min(1, "Nationality is required"),

  // Account Details (UserAccounts)
  email: z.string().email("Invalid email format"),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  landline: z.string().optional().nullable(),

  // Professional Information (Visitors) - All optional initially
  jobTitle: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  industry: z.nativeEnum(Industry).optional().nullable(),
  industryOthers: z.string().optional().nullable(),
  companyAddress: z.string().optional().nullable(),
  companyWebsite: z.string().optional().nullable(),
  businessEmail: z.string().email().optional().nullable().or(z.literal("")),

  // Interests & Preferences
  attendingDays: z.array(z.nativeEnum(EventDay)).min(1, "Select at least one attending day"),
  eventParts: z.array(z.string()).min(1, "Select at least one event part"),
  attendeeType: z.nativeEnum(AttendeeType),
  interestAreas: z.array(z.nativeEnum(InterestArea)).min(1, "Select at least one interest area"),
  receiveUpdates: z.boolean(),
  inviteToFutureEvents: z.boolean(),

  // Accessibility & Safety
  specialAssistance: z.string().optional().nullable(),
  emergencyContactPerson: z.string().min(1, "Emergency contact person is required"),
  emergencyContactNumber: z.string().min(1, "Emergency contact number is required"),

  // Consent
  dataPrivacyConsent: z.boolean().refine(val => val === true, "Data privacy consent is required"),
  hearAboutEvent: z.nativeEnum(HearAboutEvent),
  hearAboutOthers: z.string().optional().nullable(),
});

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

      // Create UserDetails
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

    return NextResponse.json({
      success: true,
      message: "Visitor registration completed successfully",
      data: {
        userId: result.user.id,
        visitorId: result.visitor.id,
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