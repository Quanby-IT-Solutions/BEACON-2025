
import { AgeBracket, AttendeeType, Gender, HearAboutEvent, Industry, InterestArea } from "@prisma/client";
import { z } from "zod";


// Base schema without conditional validation
export const baseVisitorSchema = z.object({
  // Personal Information (user_details)
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional().nullable(),
  suffix: z.string().optional().nullable(),
  preferredName: z.string().optional().nullable(),
  gender: z.nativeEnum(Gender),
  genderOthers: z.string().optional().nullable(),
  ageBracket: z.nativeEnum(AgeBracket),
  nationality: z.string().min(1, "Nationality is required"),
  faceScannedUrl: z.string().min(1, "Face capture is required"),
  mailingAddress: z.string().optional(),

  // Account Details (user_accounts)
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
  attendingDays: z.array(z.string()).min(1, "Select at least one attending day"),
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

// Registration schema with conditional validation
export const registrationSchema = baseVisitorSchema
  .refine((data) => {
    // If attendee type is STUDENT_ACADEMIC, job title is optional
    if (data.attendeeType === AttendeeType.STUDENT_ACADEMIC) {
      return true;
    }
    // For non-students, require job title
    return data.jobTitle && data.jobTitle.trim().length > 0;
  }, {
    message: "Job title is required for non-student attendees",
    path: ["jobTitle"],
  })
  .refine((data) => {
    // If attendee type is STUDENT_ACADEMIC, company name is optional
    if (data.attendeeType === AttendeeType.STUDENT_ACADEMIC) {
      return true;
    }
    // For non-students, require company name
    return data.companyName && data.companyName.trim().length > 0;
  }, {
    message: "Company/School name is required for non-student attendees",
    path: ["companyName"],
  })
  .refine((data) => {
    // If attendee type is STUDENT_ACADEMIC, industry is optional
    if (data.attendeeType === AttendeeType.STUDENT_ACADEMIC) {
      return true;
    }
    // For non-students, require industry
    return data.industry;
  }, {
    message: "Industry is required for non-student attendees",
    path: ["industry"],
  });

export type RegistrationFormData = z.infer<typeof baseVisitorSchema>;

// Use undefined for better form UX with selects
export const defaultRegistrationValues: Partial<RegistrationFormData> = {
  firstName: "Alro",
  lastName: "John",
  middleName: "Smith",
  suffix: "Jr.",
  preferredName: "Al",
  attendeeType: AttendeeType.STUDENT_ACADEMIC,
  ageBracket: AgeBracket.AGE_18_24,
  mailingAddress: '',
  // Don't set enum defaults - let user choose
  gender: Gender.MALE,
  genderOthers: "",
  nationality: "Filipino",
  email: "alro.john@example.com",
  mobileNumber: "09123456789",
  landline: "0287654321",
  jobTitle: "Software Engineer",
  companyName: "Tech Solutions Inc.",
  industry: Industry.GOVERNMENT,
  industryOthers: "Information Technology",
  companyAddress: "123 Tech Street",
  companyWebsite: "https://techsolutions.com",
  businessEmail: "business@techsolutions.com",
  attendingDays: [],
  eventParts: ["EXPO", "CONFERENCE"],
  interestAreas: ["MARITIME_NAVAL_TECH", "SHIPBUILDING_REPAIR"],
  receiveUpdates: false,
  inviteToFutureEvents: false,
  specialAssistance: "Test",
  emergencyContactPerson: "Test",
  emergencyContactNumber: "09815133675",
  dataPrivacyConsent: false,
  hearAboutEvent: HearAboutEvent.FACEBOOK_SOCIAL_MEDIA,
  hearAboutOthers: "",
};

export const eventPartsOptions = [
  "EXPO",
  "CONFERENCE",
  "PHILIPPINE IN-WATER SHIP & BOAT SHOW",
  "BLUE RUNWAY",
  "NETWORKING & AWARDS NIGHT"
] as const;