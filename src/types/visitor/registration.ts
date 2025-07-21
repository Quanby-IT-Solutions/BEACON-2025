
import { z } from "zod";
import { AgeBracket, Gender, Industry, EventDay, AttendeeType, InterestArea, HearAboutEvent } from "@/generated/prisma";

// Base registration schema without the refine logic first
export const baseRegistrationSchema = z.object({
  // Personal Information (UserDetails)
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  preferredName: z.string().optional(),
  gender: z.nativeEnum(Gender),
  genderOthers: z.string().optional(),
  ageBracket: z.nativeEnum(AgeBracket),
  nationality: z.string().min(1, "Nationality is required"),

  // Account Details (UserAccounts)
  email: z.string().email("Invalid email format"),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  landline: z.string().optional(),

  // Professional Information (Visitors) - Conditional based on attendeeType
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
  industry: z.nativeEnum(Industry).optional(),
  industryOthers: z.string().optional(),
  companyAddress: z.string().optional(),
  companyWebsite: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal("")),

  // Interests & Preferences
  attendingDays: z.array(z.nativeEnum(EventDay)).min(1, "Select at least one attending day"),
  eventParts: z.array(z.string()).min(1, "Select at least one event part"),
  attendeeType: z.nativeEnum(AttendeeType),
  interestAreas: z.array(z.nativeEnum(InterestArea)).min(1, "Select at least one interest area"),
  receiveUpdates: z.boolean(),
  inviteToFutureEvents: z.boolean(),

  // Accessibility & Safety
  specialAssistance: z.string().optional(),
  emergencyContactPerson: z.string().min(1, "Emergency contact person is required"),
  emergencyContactNumber: z.string().min(1, "Emergency contact number is required"),

  // Consent
  dataPrivacyConsent: z.boolean().refine(val => val === true, "Data privacy consent is required"),
  hearAboutEvent: z.nativeEnum(HearAboutEvent),
  hearAboutOthers: z.string().optional(),
});

// Registration schema with conditional validation
export const registrationSchema = baseRegistrationSchema
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

export type RegistrationFormData = z.infer<typeof baseRegistrationSchema>;

// Use undefined for better form UX with selects
export const defaultRegistrationValues: Partial<RegistrationFormData> = {
  firstName: "Alro",
  lastName: "John",
  middleName: "Smith",
  suffix: "Jr.",
  preferredName: "Al",
  attendeeType: AttendeeType.STUDENT_ACADEMIC,
  ageBracket: AgeBracket.AGE_18_24,
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
  attendingDays: [EventDay.OCT_1],
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